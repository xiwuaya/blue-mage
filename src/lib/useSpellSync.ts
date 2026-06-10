import { ref, watch, computed } from 'vue';
import spells from "../../tools/spells.json";
import { loadSetting, saveSetting } from "./setting";
import type { SpellStatusArray, SpellStatus } from "./interface";

// 1. 将所有状态定义在函数外部，使其成为全局单例 (类似 Pinia Store)
const spellStatus = ref<SpellStatusArray>(loadSetting<SpellStatusArray>("spell-status") || []);
const partyData = ref<string[]>(loadSetting<string[]>("party-data") || Array(7).fill(""));
const partyNames = ref<string[]>(loadSetting<string[]>("party-names") || Array(7).fill(""));
const partyVisibilityStates = ref<number[]>(loadSetting<number[]>("party-visibility-states") || Array(7).fill(0));

const user1Name = ref<string>(loadSetting<string>("user1-name") || "");
const user1VisibilityState = ref<number>(loadSetting<number>("user1-visibility-state") ?? 0);
const user1Spells = ref<string>("");

// 标记是否已经初始化过监听器
let isInitialized = false;

export function useSpellSync() {
  if (!isInitialized) {
    // --- 首次加载初始化 ---
    
    // 初始化用户1的文本框数据
    user1Spells.value = spells
      .filter((_, i) => spellStatus.value[i] !== 1)
      .map((s: any) => Number(s.no))
      .sort((a: number, b: number) => a - b)
      .join(" ");

    // --- 注册响应式监听器 (Watchers) ---
    // 1. 主界面勾选 -> 同步给用户 1 文本框
    watch(spellStatus, (newStatus) => {
      if (user1VisibilityState.value !== 2) {
        user1Spells.value = spells
          .filter((_, i) => newStatus[i] !== 1)
          .map((s: any) => Number(s.no))
          .sort((a: number, b: number) => a - b)
          .join(" ");
      }
    }, { deep: true });

    // 2. 弹窗修改用户 1 文本框 -> 同步回主界面勾选
    watch(user1Spells, (val) => {
      const nums = (val.match(/\d+/g) || []).map(Number);
      const unlearnedSet = new Set(nums);
      
      const statusArr: SpellStatusArray = spells.map((s: any) =>
        unlearnedSet.has(Number(s.no)) ? 0 : 1
      );
      if (JSON.stringify(statusArr) !== JSON.stringify(spellStatus.value)) {
        saveSetting("spell-status", statusArr);
        spellStatus.value = statusArr;
      }
    });

    // 3. 用户 1 取消隐藏时 -> 立刻对齐一次最新数据
    watch(user1VisibilityState, (val) => {
      saveSetting("user1-visibility-state", val);
      if (val !== 2) {
        user1Spells.value = spells
          .filter((_, i) => spellStatus.value[i] !== 1)
          .map((s: any) => Number(s.no))
          .sort((a: number, b: number) => a - b)
          .join(" ");
      }
    });

    // 4. 自动保存队伍杂项到本地
    watch(user1Name, val => saveSetting("user1-name", val));
    watch(partyData, val => saveSetting("party-data", val), { deep: true });
    watch(partyNames, val => saveSetting("party-names", val), { deep: true });
    watch(partyVisibilityStates, val => saveSetting("party-visibility-states", val), { deep: true });

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

  // 新增：附带用户名称的有效用户数据
  const validUsersWithNames = computed(() => {
    const users: { name: string, set: Set<number> }[] = [];
    if (user1VisibilityState.value !== 2) {
      const nums = (user1Spells.value.match(/\d+/g) || []).map(Number);
      users.push({ name: user1Name.value || '用户 1 (我)', set: new Set(nums) });
    }
    for (let i = 0; i < partyData.value.length; i++) {
      if (partyVisibilityStates.value[i] !== 2) {
        const str = partyData.value[i] || "";
        if (str.trim()) {
          const nums = (str.match(/\d+/g) || []).map(Number);
          users.push({ name: partyNames.value[i] || `用户 ${i + 2}`, set: new Set(nums) });
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

  // 是否处于多人模式（至少有一个未隐藏且非空的队友存在时，主界面才启用多人视图）
  const isPartyModeActive = computed(() => {
    return partyData.value.some((str, i) => str.trim() && partyVisibilityStates.value[i] !== 2);
  });

  // --- 核心操作方法 (Actions) ---
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
    partyVisibilityStates,
    user1Name,
    user1VisibilityState,
    user1Spells,
    unlearnedCountMap,
    unlearnedNamesMap,
    isPartyModeActive,
    handleStatusChange,
    handleBatchStatusChange
  };
}
