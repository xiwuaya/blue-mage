export const loadSetting = <T>(key: string): T | undefined => {
  // 预渲染在 node 里跑，没有 window。这里必须判 window 而不是判 localStorage：
  // Node 22.4+ 的 --experimental-webstorage 会注入 globalThis.localStorage，
  // 那样守卫会失效并把行为变成碰运气。
  if (typeof window === "undefined") return;

  let text;
  if (localStorage) {
    text = localStorage.getItem(key);
  } else {
    const cookie = document.cookie;
    let pos = cookie.indexOf(key + "=");
    if (pos >= 0) {
      pos += key.length + 1;
      const endPos = cookie.indexOf(";", pos);
      text = cookie.substr(pos, endPos === -1 ? undefined : endPos - pos);
    }
  }

  if (!text) return;

  try {
    return JSON.parse(text);
  } catch (e) {
    return;
  }
};

export const saveSetting = <T>(key: string, value: T) => {
  if (typeof window === "undefined") return;

  const text = JSON.stringify(value);

  if (localStorage) {
    localStorage.setItem(key, text);
  } else {
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 10);
    document.cookie = `${key}=${text};expires=${expire.toUTCString()};path=/`;
  }
};
