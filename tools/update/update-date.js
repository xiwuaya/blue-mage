const fs = require('fs');

const appVuePath = './src/App.vue';

// 1. 读取 App.vue 内容
let content = fs.readFileSync(appVuePath, 'utf-8');

// 2. 获取脚本运行时的当前日期 (北京时间)
// 为了避免 GitHub Actions 虚拟机默认 UTC 时区导致日期差一天，强制加上 8 小时偏移
const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000); 
const year = now.getUTCFullYear();
const month = now.getUTCMonth() + 1;
const day = now.getUTCDate();
const dateString = `${year}年${month}月${day}日`;

// 3. 执行正则表达式匹配与替换
// 正则解析: 
// (本网页内容最近一次更新于<strong>) 作为捕获组 1 ($1)
// .*? 代表中间的任意日期文本（非贪婪匹配）
// (<\/strong>) 作为捕获组 2 ($2)
const regex = /(本网页内容最近一次更新于<strong>).*?(<\/strong>)/g;

const newContent = content.replace(regex, `$1${dateString}$2`);

// 4. 将新内容写回 App.vue
if (content !== newContent) {
  fs.writeFileSync(appVuePath, newContent, 'utf-8');
  console.log(`🕒 App.vue 页面更新日期已自动修改为：${dateString}`);
} else {
  console.log(`🕒 App.vue 日期已经是最新，或未找到匹配文本。`);
}
