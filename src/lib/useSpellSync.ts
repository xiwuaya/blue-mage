import { ref, watch, computed } from 'vue';
import spells from "../../tools/data/spells.json";
import { loadSetting, saveSetting } from "./setting";
import type { SpellStatusArray, SpellStatus } from "./interface";

// 1. 将所有状态定义在函数外部，使其成为全局单例 (类似 Pinia Store)
// const spellStatus = ref<SpellStatusArray>(loadSetting<SpellStatusArray>("spell-status") || []);
const spellStatus = ref<SpellStatusArray>(
  (() => {
    const saved = loadSetting<SpellStatusArray>("spell-status");

    if (saved) {
      return saved;
    }

    const defaultStatus = Array(spells.length).fill(0) as SpellStatusArray;
    defaultStatus[0] = 1;

    saveSetting("spell-status", defaultStatus);

    return defaultStatus;
  })()
);
const partyData = ref<string[]>(loadSetting<string[]>("party-data") || Array(3).fill(""));
const partyNames = ref<string[]>(loadSetting<string[]>("party-names") || Array(3).fill(""));
const DEFAULT_PARTY_COLORS = [
  "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4",
  "#42d4f4", "#f032e6", "#bfef45", "#fabed4", "#469990", "#dcbeff",
  "#9A6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1",
  "#000075", "#a9a9a9"
];

const getDefaultPartyColor = (index: number) =>
  DEFAULT_PARTY_COLORS[index % DEFAULT_PARTY_COLORS.length];

const normalizePartyColors = (colors: string[] | undefined, length: number) => {
  const result = Array.from({ length }, (_, index) =>
    colors?.[index] || getDefaultPartyColor(index)
  );
  return result;
};

const partyColors = ref<string[]>(normalizePartyColors(
  loadSetting<string[]>("party-colors"),
  (loadSetting<string[]>("party-data") || Array(3).fill("")).length + 1
));
const partyVisibilityStates = ref<number[]>(loadSetting<number[]>("party-visibility-states") || Array(3).fill(0));

const user1Name = ref<string>(loadSetting<string>("user1-name") || "");
const user1VisibilityState = ref<number>(loadSetting<number>("user1-visibility-state") ?? 0);
const user1Spells = ref<string>("");

// 主用户指针：0 = 用户 1，k ≥ 1 = 队友 partyData[k-1]。指针所指槽位即「我」，
// 主页勾选状态（spellStatus）记录的就是这个人的存档；其余槽位的文本是静态 blob。
// 「设为我」切换的就是这个指针，数据原地不动（见 AIWorks/主用户切换/plan.md）。
const mainUserSlot = ref<number>(loadSetting<number>("main-user-slot") ?? 0);

// 由当前存档生成「未掌握技能编号串」（各槽位文本框的统一数据形态）
const buildUnlearnedString = () =>
  spells
    .filter((_, i) => spellStatus.value[i] !== 1)
    .map((s: any) => Number(s.no))
    .sort((a: number, b: number) => a - b)
    .join(" ");

// 由编号串重建存档（文本框编辑 -> 主页勾选 的解析，原用户 1 监听的泛化）
const rebuildStatusFromString = (val: string): SpellStatusArray => {
  const nums = (val.match(/\d+/g) || []).map(Number);
  const unlearnedSet = new Set(nums);
  return spells.map((s: any) => (unlearnedSet.has(Number(s.no)) ? 0 : 1));
};

// 指针所指槽位的文本（槽 0 = 用户 1 文本框，槽 k = 队友文本框），可写。
// 指针移动会让它整体换源 —— 存档重建监听借这一点统一完成切换后的数据装载。
const mainUserSpells = computed<string>({
  get: () => {
    if (mainUserSlot.value === 0) return user1Spells.value;
    return partyData.value[mainUserSlot.value - 1] ?? "";
  },
  set: (val) => {
    if (mainUserSlot.value === 0) {
      user1Spells.value = val;
      return;
    }
    const idx = mainUserSlot.value - 1;
    if (idx >= partyData.value.length || partyData.value[idx] === val) return;
    const newPartyData = [...partyData.value];
    newPartyData[idx] = val;
    partyData.value = newPartyData;
  },
});

// 指针所指槽位的三态显隐（0 可见 / 1 必带 / 2 隐藏）。指针与三态正交：
// 所指用户被「应用该配置」隐藏时，继承原用户 1 隐藏的全部语义。
const mainUserVisibilityState = computed(() =>
  mainUserSlot.value === 0
    ? user1VisibilityState.value
    : (partyVisibilityStates.value[mainUserSlot.value - 1] ?? 0)
);

// 主用户名（主页横幅用）
const mainUserName = computed(() =>
  mainUserSlot.value === 0
    ? (user1Name.value || "用户 1")
    : (partyNames.value[mainUserSlot.value - 1] || `用户 ${mainUserSlot.value + 1}`)
);

// 槽位显示名：所指槽位带「(我)」后缀（未掌握名单徽标用）
const slotDisplayName = (slot: number) => {
  const base =
    slot === 0
      ? user1Name.value || "用户 1"
      : partyNames.value[slot - 1] || `用户 ${slot + 1}`;
  return slot === mainUserSlot.value ? `${base} (我)` : base;
};

// 标记是否已经初始化过监听器
let isInitialized = false;

export function useSpellSync() {
  if (!isInitialized) {
    // --- 首次加载初始化 ---

    // 槽 0 的文本：指针在 0 时从存档派生（历史行为）；指针 ≠ 0 时存档已是
    // 所指队友的数据，槽 0 必须读「user1-spells」里切走时落盘的原「我」数据，
    // 不能从存档重建（否则原「我」的数据会被所指队友覆盖）。无键时（异常态）退回派生。
    user1Spells.value =
      mainUserSlot.value === 0
        ? buildUnlearnedString()
        : loadSetting<string>("user1-spells") ?? buildUnlearnedString();
    // 计算结果立即落盘：保存 watcher 注册在其后，捕获不到这次赋值；若不显式写，
    // 「本会话只切换、不打勾」的路径会让该键一直缺失，下次启动指针 ≠ 0 时
    // 无键可读，回退分支会把所指队友的数据错误复制进槽 0
    saveSetting("user1-spells", user1Spells.value);

    // --- 注册响应式监听器 (Watchers) ---
    // 1. 主界面勾选 -> 同步给主用户文本框（所指用户隐藏时冻结，见监听 3）
    watch(spellStatus, () => {
      if (mainUserVisibilityState.value !== 2) {
        mainUserSpells.value = buildUnlearnedString();
      }
    }, { deep: true });

    // 2. 主用户文本框编辑 -> 同步回主界面勾选。
    //    指针切换也经这里完成装载：指针移动使 mainUserSpells 换源，监听按新槽位
    //    的文本重建存档。JSON 对比去重，防止「存档 -> 文本 -> 存档」循环。
    watch(mainUserSpells, (val) => {
      const statusArr = rebuildStatusFromString(val);
      if (JSON.stringify(statusArr) !== JSON.stringify(spellStatus.value)) {
        saveSetting("spell-status", statusArr);
        spellStatus.value = statusArr;
      }
    });

    // 3. 主用户取消隐藏时 -> 立刻对齐一次最新数据。
    //    必须区分「所指槽位自己取消隐藏」和「指针移动带来的所指三态变化」：
    //    后者是切换的必然副产物，若此时对齐，会把旧用户的存档写进新所指槽位，
    //    随后被监听 2 当成新主用户的数据重建存档 —— 数据错乱。指针刚移动时跳过。
    let pointedVisSlot = mainUserSlot.value;
    watch(mainUserVisibilityState, (val) => {
      const slotNow = mainUserSlot.value;
      if (slotNow !== pointedVisSlot) {
        pointedVisSlot = slotNow;
        return;
      }
      if (val !== 2) {
        mainUserSpells.value = buildUnlearnedString();
      }
    });

    // 4. 自动保存队伍杂项到本地
    watch(user1Name, val => saveSetting("user1-name", val));
    // 槽 0 文本落盘：指针切走后存档（spell-status）归所指队友，刷新页面要靠
    // 这个键还原原「我」的数据
    watch(user1Spells, val => saveSetting("user1-spells", val));
    watch(user1VisibilityState, val => saveSetting("user1-visibility-state", val));
    watch(partyData, val => saveSetting("party-data", val), { deep: true });
    watch(partyNames, val => saveSetting("party-names", val), { deep: true });
    watch(partyColors, val => saveSetting("party-colors", val), { deep: true });
    watch(partyVisibilityStates, val => saveSetting("party-visibility-states", val), { deep: true });
    watch(mainUserSlot, val => saveSetting("main-user-slot", val));

    // 5. 指针越界兜底：槽位比指针少（异常态）时回落到用户 1，存档随之从
    //    槽 0 文本重建；正常的删除/重置路径由 PartyModal 显式处理指针跟随
    watch(partyData, () => {
      if (mainUserSlot.value > partyData.value.length) {
        mainUserSlot.value = 0;
      }
    });

    isInitialized = true; // 上锁，确保后续任何组件再次调用也不会重复挂载监听器
  }

  // --- 衍生状态计算 (Computed) ---
  
  // 解析有效的队伍用户（计算未掌握人数时，直接跳过被隐藏的用户）
  const validUsers = computed(() => {
    const users = [];
    if (user1VisibilityState.value !== 2) {
      const nums = (user1Spells.value.match(/\d+/g) || []).map(Number);
      users.push(new Set(nums));
    }
    for (let i = 0; i < partyData.value.length; i++) {
      if (partyVisibilityStates.value[i] !== 2) {
        const str = partyData.value[i] || "";
        if (str.trim()) {
          const nums = (str.match(/\d+/g) || []).map(Number);
          users.push(new Set(nums));
        }
      }
    }
    return users;
  });

  // 计算出每个技能有多少个有效且未隐藏的用户尚未掌握
  const unlearnedCountMap = computed(() => {
    const map = new Map<number, number>();
    spells.forEach((spell: any) => {
      let count = 0;
      validUsers.value.forEach(userSet => {
        if (userSet.has(Number(spell.no))) count++;
      });
      map.set(Number(spell.no), count);
    });
    return map;
  });

  // 新增：附带用户名称的有效用户数据（主用户带「(我)」后缀）
  const validUsersWithNames = computed(() => {
    const users: { name: string, color: string, set: Set<number> }[] = [];
    if (user1VisibilityState.value !== 2) {
      const nums = (user1Spells.value.match(/\d+/g) || []).map(Number);
      users.push({ name: slotDisplayName(0), color: partyColors.value[0] || getDefaultPartyColor(0), set: new Set(nums) });
    }
    for (let i = 0; i < partyData.value.length; i++) {
      if (partyVisibilityStates.value[i] !== 2) {
        const str = partyData.value[i] || "";
        if (str.trim()) {
          const nums = (str.match(/\d+/g) || []).map(Number);
          users.push({ name: slotDisplayName(i + 1), color: partyColors.value[i + 1] || getDefaultPartyColor(i + 1), set: new Set(nums) });
        }
      }
    }
    return users;
  });

  // 新增：计算出每个技能究竟被哪些人未掌握
  const unlearnedNamesMap = computed(() => {
    const map = new Map<number, string[]>();
    spells.forEach((spell: any) => {
      const names: string[] = [];
      validUsersWithNames.value.forEach(user => {
        if (user.set.has(Number(spell.no))) names.push(user.name);
      });
      map.set(Number(spell.no), names);
    });
    return map;
  });

  const unlearnedUsersMap = computed(() => {
    const map = new Map<number, { name: string, color: string }[]>();
    spells.forEach((spell: any) => {
      const users: { name: string, color: string }[] = [];
      validUsersWithNames.value.forEach(user => {
        if (user.set.has(Number(spell.no))) users.push({ name: user.name, color: user.color });
      });
      map.set(Number(spell.no), users);
    });
    return map;
  });

  // 是否处于多人模式（至少有一个未隐藏且非空的队友存在时，主界面才启用多人视图）
  const isPartyModeActive = computed(() => {
    return partyData.value.some((str, i) => str.trim() && partyVisibilityStates.value[i] !== 2);
  });

  // --- 核心操作方法 (Actions) ---
  // 切换主用户（面板「设为我」按钮）。先把当前存档落盘到旧所指槽位，再移指针：
  // 落盘时无视旧槽位的三态 —— 隐藏期间主页勾选只进了存档、没进文本框，这一步
  // 把冻结期的勾选收敛进他的数据串，否则会在存档被新用户数据覆盖时静默丢失
  // （可见状态下为幂等空转）。存档重建由 mainUserSpells 监听统一完成。
  const setMainUser = (slot: number) => {
    if (slot === mainUserSlot.value) return;
    if (!Number.isInteger(slot) || slot < 0 || slot > partyData.value.length) return;
    mainUserSpells.value = buildUnlearnedString();
    mainUserSlot.value = slot;
  };

  // 单一状态改变同步处理器
  const handleStatusChange = (index: number, learned: SpellStatus | boolean) => {
    const statusArr: SpellStatusArray = spells.map((_, i) =>
      (i === index ? learned : spellStatus.value[i]) ? 1 : 0
    );
    saveSetting("spell-status", statusArr);
    spellStatus.value = statusArr;

    const targetSpellNo = Number(spells[index].no);
    const newPartyData = [...partyData.value];
    let isChanged = false;
    
    for (let i = 0; i < newPartyData.length; i++) {
      if (partyVisibilityStates.value[i] === 2) continue;
      if (i + 1 === mainUserSlot.value) continue; // 所指槽位的数据由存档表达，监听 1 统一刷新

      const str = newPartyData[i] || "";
      if (str.trim()) {
        const nums = (str.match(/\d+/g) || []).map(Number);
        const numSet = new Set(nums);

        if (learned) numSet.delete(targetSpellNo);
        else numSet.add(targetSpellNo);

        const newStr = Array.from(numSet).sort((a, b) => a - b).join(" ");
        if (newStr !== str) {
          newPartyData[i] = newStr;
          isChanged = true;
        }
      }
    }
    if (isChanged) partyData.value = newPartyData;
  };
  
  // 批量状态改变同步处理器
  const handleBatchStatusChange = (patch: string, learned: boolean) => {
    const statusArr: SpellStatusArray = spells.map((s, i) => {
      if (patch === "all" || s.patch === patch) return learned ? 1 : 0;
      return spellStatus.value[i];
    });
    saveSetting("spell-status", statusArr);
    spellStatus.value = statusArr;

    const newPartyData = [...partyData.value];
    let isChanged = false;
    
    for (let i = 0; i < newPartyData.length; i++) {
      if (partyVisibilityStates.value[i] === 2) continue;
      if (i + 1 === mainUserSlot.value) continue; // 所指槽位的数据由存档表达，监听 1 统一刷新

      const str = newPartyData[i] || "";
      if (str.trim()) {
        const nums = (str.match(/\d+/g) || []).map(Number);
        const numSet = new Set(nums);

        spells.forEach((s) => {
          if (patch === "all" || s.patch === patch) {
            const targetSpellNo = Number(s.no);
            if (learned) numSet.delete(targetSpellNo);
            else numSet.add(targetSpellNo);
          }
        });
        
        const newStr = Array.from(numSet).sort((a, b) => a - b).join(" ");
        if (newStr !== str) {
          newPartyData[i] = newStr;
          isChanged = true;
        }
      }
    }
    if (isChanged) partyData.value = newPartyData;
  };

  // 返回所有给 UI 渲染或调用的变量与方法
  return {
    spellStatus,
    partyData,
    partyNames,
    partyColors,
    partyVisibilityStates,
    user1Name,
    user1VisibilityState,
    user1Spells,
    mainUserSlot,
    mainUserName,
    setMainUser,
    unlearnedCountMap,
    unlearnedNamesMap,
    unlearnedUsersMap,
    isPartyModeActive,
    handleStatusChange,
    handleBatchStatusChange
  };
}
