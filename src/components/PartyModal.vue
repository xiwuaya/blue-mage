<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue';
import { spells } from '@/lib/spell';
import type { FilterTypes } from '@/lib/interface';
import PartyGroupingWorker from '@/lib/partyGrouping.worker?worker';
import type { PartyGroupResult } from '@/lib/partyGrouping';
import { useSpellSync } from '@/lib/useSpellSync';
import { spellIcon, spellIconSrcset } from '@/icon';

// ==========================================
// 1. 属性接收与事件定义 (增加了来自 App.vue 的三态状态同步)
// ==========================================
const props = defineProps<{
  show: boolean;
  user1Spells: string;
  user1Name: string;
  partyData: string[];
  partyNames: string[];
  partyColors: string[];
  filterTypes: FilterTypes;
  user1VisibilityState: number;
  partyVisibilityStates: number[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:user1Spells', val: string): void;
  (e: 'update:user1Name', val: string): void;
  (e: 'update:partyData', val: string[]): void;
  (e: 'update:partyNames', val: string[]): void;
  (e: 'update:partyColors', val: string[]): void;
  (e: 'update:user1VisibilityState', val: number): void;
  (e: 'update:partyVisibilityStates', val: number[]): void;
  (e: 'resetMinUnlearned'): void;
}>();

// 主用户指针与切换动作来自全局 store（useSpellSync 单例，App.vue 已初始化监听）
const { mainUserSlot, setMainUser } = useSpellSync();

// ==========================================
// 2. 本地状态管理与双向数据对齐
// ==========================================
const m = ref<number | "">("");
const isAlgoExpanded = ref(false);

const showCopyToast = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const localUser1Spells = ref(props.user1Spells);
const localUser1Name = ref(props.user1Name);
const localPartyData = ref([...props.partyData]);
const localPartyNames = ref([...props.partyNames]);
const localPartyColors = ref([...props.partyColors]);

// 将父组件提升的显隐三态映射为本地变量
const localUser1VisibilityState = ref(props.user1VisibilityState);
const localPartyVisibilityStates = ref([...props.partyVisibilityStates]);

watch(localUser1Spells, (val) => {
  if (val !== props.user1Spells) emit('update:user1Spells', val);
});
watch(localUser1Name, (val) => {
  if (val !== props.user1Name) emit('update:user1Name', val);
});
watch(localPartyData, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyData)) {
    emit('update:partyData', [...val]);
  }
}, { deep: true });
watch(localPartyNames, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyNames)) {
    emit('update:partyNames', [...val]);
  }
}, { deep: true });
watch(localPartyColors, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyColors)) {
    emit('update:partyColors', [...val]);
  }
}, { deep: true });

// 双向传递：同步将内部变更派发回 App.vue
watch(localUser1VisibilityState, (val) => {
  if (val !== props.user1VisibilityState) emit('update:user1VisibilityState', val);
});
watch(localPartyVisibilityStates, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyVisibilityStates)) {
    emit('update:partyVisibilityStates', [...val]);
  }
}, { deep: true });

watch(() => props.user1Spells, (val) => {
  if (localUser1Spells.value !== val) localUser1Spells.value = val;
});
watch(() => props.user1Name, (val) => {
  if (localUser1Name.value !== val) localUser1Name.value = val;
});
watch(() => props.partyData, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(localPartyData.value)) {
    localPartyData.value = [...val];
  }
}, { deep: true });
watch(() => props.partyNames, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(localPartyNames.value)) {
    localPartyNames.value = [...val];
  }
}, { deep: true });
watch(() => props.partyColors, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(localPartyColors.value)) {
    localPartyColors.value = [...val];
  }
}, { deep: true });

watch(() => props.user1VisibilityState, (val) => {
  if (localUser1VisibilityState.value !== val) localUser1VisibilityState.value = val;
});
watch(() => props.partyVisibilityStates, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(localPartyVisibilityStates.value)) {
    localPartyVisibilityStates.value = [...val];
  }
}, { deep: true });

// ==========================================
// 3. 核心功能函数
// ==========================================
const triggerToast = () => {
  showCopyToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { showCopyToast.value = false; }, 2000);
};

const copyUser1Data = async () => {
  try {
    await navigator.clipboard.writeText(localUser1Spells.value);
    triggerToast();
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = localUser1Spells.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    triggerToast();
  }
};

const DEFAULT_PARTY_COLORS = [
  "#e6194B", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4",
  "#42d4f4", "#f032e6", "#bfef45", "#fabed4", "#469990", "#dcbeff",
  "#9A6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1",
  "#000075", "#a9a9a9"
];
const getDefaultPartyColor = (index: number) => DEFAULT_PARTY_COLORS[index % DEFAULT_PARTY_COLORS.length];

const ensurePartyColor = (index: number) => {
  if (!localPartyColors.value[index]) localPartyColors.value[index] = getDefaultPartyColor(index);
  return localPartyColors.value[index];
};



const setPartyColor = (index: number, event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  localPartyColors.value[index] = value;
};

const resetParty = () => {
  // 唤起浏览器原生确认框
  const isConfirmed = window.confirm("确定要重置所有队友数据吗？此操作无法撤销。");
  // 只有用户点击了“确定”，才向父组件发送修改指令
  if (isConfirmed) {
    // 指针回用户 1：存档随之从槽 0 文本重建，避免停在数据被清空的队友槽位上
    mainUserSlot.value = 0;
    // const len = localPartyData.value.length;
    const len = 3;
    localPartyData.value = Array(len).fill("");
    localPartyNames.value = Array(len).fill("");
    localPartyColors.value = Array.from({ length: len + 1 }, (_, index) => getDefaultPartyColor(index));
    localPartyVisibilityStates.value = Array(len).fill(0); // 重置时恢复为默认可见状态
    emit('resetMinUnlearned');
  }
};

const addTeammate = () => {
  if (localPartyData.value.length >= 19) {
    alert("为保证页面计算流畅，最多支持添加 19 名队友（含自己共 20 人）哦！");
    return;
  }
  localPartyData.value.push("");
  localPartyNames.value.push("");
  const usedColors = new Set(localPartyColors.value);
  const nextColor = DEFAULT_PARTY_COLORS.find(color => !usedColors.has(color)) || getDefaultPartyColor(localPartyColors.value.length);
  localPartyColors.value.push(nextColor);
  localPartyVisibilityStates.value.push(0); // 新加队友默认是可见状态（0）
};

const removeTeammate = (index: number) => {
  const slot = index + 1;
  // 指针跟随：删的就是主用户 -> 回落到用户 1（存档由监听从槽 0 文本重建，该用户
  // 的会话勾选随删除丢弃，与「删除即丢弃队友数据」的既有语义一致）；
  // 删的是主用户上方的队友 -> 指针平移，继续指向同一个人
  if (slot === mainUserSlot.value) {
    mainUserSlot.value = 0;
  } else if (slot < mainUserSlot.value) {
    mainUserSlot.value -= 1;
  }
  localPartyData.value.splice(index, 1);
  localPartyNames.value.splice(index, 1);
  localPartyColors.value.splice(index + 1, 1);
  localPartyVisibilityStates.value.splice(index, 1);
};

// 将参数从 type: string 修改为 method: any (或具体的 SpellMethod 类型)
const getFilterKey = (method: any): keyof FilterTypes => {
  // 增加判断：如果是 hunt 分类且 rank 为 'B'，则归类到 map
  if (method.type === 'hunt' && method.rank === 'B') {
    return 'map';
  }
  
  if (method.type === 'levequests') {
    return 'map';
  }
  
  if (method.type === 'fate' || method.type === 'hunt' || method.type === 'treasure' || method.type === 'guildhests' || method.type === 'jobquest' ) {
    return 'other';
  }
  if (method.type === 'special') {
    return 'carnivale';
  }
  return method.type as keyof FilterTypes;
};


// 提取自原 bestParty：构建算法输入（activeUsers / mustIncludeMask / spellMasks），
// 供「最优组队推荐」与「多队伍组合推荐」共用
const buildAlgoInputData = () => {
  const activeUsers: { originalIndex: number, spellSet: Set<number> }[] = [];
  let mustIncludeMask = 0;
  let activeIndex = 0;

  // 1. 处理用户1（不等于 2 隐蔽状态时加入计算池）
  if (localUser1VisibilityState.value !== 2) {
    // 修改后：直接匹配字符串中所有的连续数字序列
    const u1Nums = (localUser1Spells.value.match(/\d+/g) || []).map(Number);

    activeUsers.push({ originalIndex: 0, spellSet: new Set(u1Nums) });
    if (localUser1VisibilityState.value === 1) {
      mustIncludeMask |= (1 << activeIndex);
    }
    activeIndex++;
  }

  // 2. 处理队友列表
  for (let i = 0; i < localPartyData.value.length; i++) {
    if (localPartyVisibilityStates.value[i] !== 2) {
      const str = localPartyData.value[i] || "";
      if (str.trim()) {
        const nums = (str.match(/\d+/g) || []).map(Number);
        activeUsers.push({ originalIndex: i + 1, spellSet: new Set(nums) });
      } else {
        activeUsers.push({ originalIndex: i + 1, spellSet: new Set() });
      }

      if (localPartyVisibilityStates.value[i] === 1) {
        mustIncludeMask |= (1 << activeIndex);
      }
      activeIndex++;
    }
  }

  const validSpellNos = new Set<number>();
  for (const spell of spells) {
    const isValid = spell.method.some((method) => props.filterTypes[getFilterKey(method)]);
    if (isValid) validSpellNos.add(Number(spell.no));
  }

  const spellMasks = new Map<number, number>();
  for (let i = 0; i < activeUsers.length; i++) {
    for (const spellNo of activeUsers[i].spellSet) {
      if (!validSpellNos.has(spellNo)) continue;
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i));
    }
  }

  return { activeUsers, mustIncludeMask, spellMasks };
};

// ==========================================
// 4. 最优组队算法 (精准筛选三态组合)
// ==========================================
const bestParty = computed(() => {
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

  const { activeUsers, mustIncludeMask, spellMasks } = buildAlgoInputData();
  const n = activeUsers.length;

  let tempMask = mustIncludeMask;
  let mustIncludeCount = 0;
  while (tempMask > 0) {
    mustIncludeCount += tempMask & 1;
    tempMask >>= 1;
  }

  if (n < targetM || mustIncludeCount > targetM) return null;

  const partyMasks = [];
  if (targetM <= n) {
    let state = (1 << targetM) - 1;
    const limit = 1 << n;

    while (state < limit) {
      if ((state & mustIncludeMask) === mustIncludeMask) {
        partyMasks.push(state);
      }
      const c = state & -state;
      const r = state + c;
      state = (((state ^ r) >>> 2) / c) | r;
    }
  }

  let maxCommonCount = -1;
  let bestPartyMasks: number[] = [];

  for (const pMask of partyMasks) {
    let currentCommonCount = 0;
    for (const sMask of spellMasks.values()) {
      if ((sMask & pMask) === pMask) currentCommonCount++;
    }

    if (currentCommonCount > maxCommonCount) {
      maxCommonCount = currentCommonCount;
      bestPartyMasks = [pMask];
    } else if (currentCommonCount === maxCommonCount) {
      bestPartyMasks.push(pMask);
    }
  }

  if (maxCommonCount === -1 || bestPartyMasks.length === 0) return null;

  const allBestUsersIndices: number[][] = [];
  for (const mask of bestPartyMasks) {
    const indices = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        indices.push(activeUsers[i].originalIndex);
      }
    }
    allBestUsersIndices.push(indices);
  }

  return { allBestUsersIndices, maxCommonCount };
});


// --- 新增：应用该队伍配置，隐藏其余未被选中的人 ---
// 主用户（指针所指槽位）的三态本地镜像读写：主用户不一定是用户 1
const getMainUserVisibilityLocal = () =>
  mainUserSlot.value === 0
    ? localUser1VisibilityState.value
    : (localPartyVisibilityStates.value[mainUserSlot.value - 1] ?? 0);
const setMainUserVisibilityLocal = (val: number) => {
  if (mainUserSlot.value === 0) {
    localUser1VisibilityState.value = val;
  } else {
    localPartyVisibilityStates.value[mainUserSlot.value - 1] = val;
  }
};

const applyConfiguration = (teamIndices: number[]) => {
  // 1. 处理主用户：如果在选中的队伍中，设为可见(0)；否则设为隐藏(2)。
  //    teamIndices 的编号体系（0 = 用户 1，i + 1 = 队友 i）与槽位编号一致，
  //    可直接与 mainUserSlot 比较；主用户被隐藏是正常路径（见 plan.md 决策 4）
  if (teamIndices.includes(mainUserSlot.value)) {
    if (getMainUserVisibilityLocal() === 2) {
      setMainUserVisibilityLocal(0);
    }
  } else {
    setMainUserVisibilityLocal(2);
  }

  // 2. 处理其他队员（跳过主用户槽位，已在上面处理）
  for (let i = 0; i < localPartyData.value.length; i++) {
    if (i + 1 === mainUserSlot.value) continue;
    // 队员的索引是 i + 1
    if (teamIndices.includes(i + 1)) {
      if (localPartyVisibilityStates.value[i] === 2) {
        localPartyVisibilityStates.value[i] = 0;
      }
    } else {
      localPartyVisibilityStates.value[i] = 2; // 隐藏不在队伍中的人
    }
  }
};

// ==========================================
// 5. 多队伍组合推荐（点击触发，Web Worker 后台计算）
// ==========================================
const displayName = (originalIndex: number) => {
  // 「(我)」后缀跟随主用户指针，不再固定在用户 1
  const base = originalIndex === 0
    ? (localUser1Name.value || '用户 1')
    : (localPartyNames.value[originalIndex - 1] || `用户 ${originalIndex + 1}`);
  return originalIndex === mainUserSlot.value ? `${base} (我)` : base;
};

// ==========================================
// 3.5 悬停预览：「设为我」按钮 → 该用户未掌握技能悬浮窗
// ==========================================
// 面板 Teleport 到 body：party-modal 有 overflow-y: auto，行内绝对定位会被裁剪。
// 按钮外层套 span 承接鼠标事件：禁用态按钮（当前/空槽）在各浏览器里鼠标事件
// 行为不一致，span 始终可靠；空槽无数据则不弹面板。
type PreviewEntry = { no: number; name: string; icon: string; srcset: string; action: number };

const previewSlot = ref<number | null>(null);
const previewPos = ref({ x: 0, y: 0 });
const previewRef = ref<HTMLElement | null>(null);
let previewShowTimer: ReturnType<typeof setTimeout> | null = null;
let previewHideTimer: ReturnType<typeof setTimeout> | null = null;

const parsePreviewList = (text: string): PreviewEntry[] => {
  const byNo = new Map(spells.map((s) => [Number(s.no), s]));
  const nums = [...new Set((text.match(/\d+/g) || []).map(Number))].sort((a, b) => a - b);
  const list: PreviewEntry[] = [];
  for (const no of nums) {
    const s = byNo.get(no);
    // 数据里不存在的编号（过期存档）直接跳过
    if (s) list.push({ no, name: s.spell, icon: spellIcon(s, true), srcset: spellIconSrcset(s, true), action: s.action });
  }
  return list;
};

const previewData = computed(() => {
  const slot = previewSlot.value;
  if (slot === null || slot > localPartyData.value.length) return null;
  const text = slot === 0 ? localUser1Spells.value : (localPartyData.value[slot - 1] || "");
  const name = slot === 0
    ? (localUser1Name.value || "用户 1")
    : (localPartyNames.value[slot - 1] || `用户 ${slot + 1}`);
  return { name, list: parsePreviewList(text), isMain: slot === mainUserSlot.value };
});

// 面板渲染后按按钮位置贴靠：优先右侧，放不下换左侧，垂直方向夹回视口内
const placePreview = (rect: DOMRect) => {
  nextTick(() => {
    const panel = previewRef.value;
    if (!panel) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    let x = rect.right + 8;
    if (x + pw > vw - 8) x = rect.left - pw - 8;
    if (x < 8) x = Math.max(8, vw - pw - 8);
    let y = rect.top;
    if (y + ph > vh - 8) y = vh - ph - 8;
    if (y < 8) y = 8;
    previewPos.value = { x, y };
  });
};

const clearPreviewTimers = () => {
  if (previewShowTimer) { clearTimeout(previewShowTimer); previewShowTimer = null; }
  if (previewHideTimer) { clearTimeout(previewHideTimer); previewHideTimer = null; }
};

const showPreview = (slot: number, e: MouseEvent) => {
  if (previewHideTimer) { clearTimeout(previewHideTimer); previewHideTimer = null; }
  // 空队友槽无数据可预览：不弹面板；面板正开着则收起
  // （用户 1 例外：学满后也允许看「没有未掌握」的状态）
  const hasData = slot === 0 || !!(localPartyData.value[slot - 1] || "").trim();
  if (!hasData) { previewSlot.value = null; return; }
  // 面板已开着时在按钮间移动：立即切换，不等延时
  const delay = previewSlot.value !== null && previewSlot.value !== slot ? 0 : 180;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  if (previewShowTimer) { clearTimeout(previewShowTimer); previewShowTimer = null; }
  previewShowTimer = setTimeout(() => {
    previewShowTimer = null;
    previewSlot.value = slot;
    placePreview(rect);
  }, delay);
};

const schedulePreviewHide = () => {
  if (previewShowTimer) { clearTimeout(previewShowTimer); previewShowTimer = null; }
  if (previewHideTimer) clearTimeout(previewHideTimer);
  previewHideTimer = setTimeout(() => {
    previewHideTimer = null;
    previewSlot.value = null;
  }, 120);
};

const cancelPreviewHide = () => {
  if (previewHideTimer) { clearTimeout(previewHideTimer); previewHideTimer = null; }
};

// 弹窗关闭 / 组件卸载时收起面板，防止 Teleport 残留
watch(() => props.show, (show) => { if (!show) { clearPreviewTimers(); previewSlot.value = null; } });
onBeforeUnmount(clearPreviewTimers);

type MultiTeamStatus = 'idle' | 'computing' | 'done' | 'error';
type MultiTeamWorkerMessage =
  | { type: 'done'; result: PartyGroupResult | null }
  | { type: 'error'; message: string };

const multiTeamStatus = ref<MultiTeamStatus>('idle');
const multiTeamResult = ref<PartyGroupResult | null>(null);
const multiTeamError = ref('');
const multiTeamElapsed = ref(0);
let multiTeamWorker: Worker | null = null;
let multiTeamTimer: ReturnType<typeof setInterval> | null = null;

const resetMultiTeam = () => {
  if (multiTeamWorker) {
    multiTeamWorker.terminate();
    multiTeamWorker = null;
  }
  if (multiTeamTimer) {
    clearInterval(multiTeamTimer);
    multiTeamTimer = null;
  }
  multiTeamStatus.value = 'idle';
  multiTeamResult.value = null;
  multiTeamError.value = '';
  multiTeamElapsed.value = 0;
};

// 成员/技能数据、过滤分类或队伍人数变化后，旧结果作废，回到待计算状态；
// 「应用该配置」引起的三态变化除外：应用后保留结果（与「最优队伍构成」应用后
// 面板继续展示的行为一致），便于继续切换应用其他队伍
let applySignatureSnapshot: string | null = null;
const algoSourceSignature = computed(() =>
  JSON.stringify([
    localUser1Spells.value,
    localUser1VisibilityState.value,
    localPartyData.value,
    localPartyVisibilityStates.value,
    props.filterTypes,
    m.value,
  ]),
);
watch(algoSourceSignature, (val) => {
  if (applySignatureSnapshot !== null && val === applySignatureSnapshot) {
    applySignatureSnapshot = null;
    return;
  }
  applySignatureSnapshot = null;
  resetMultiTeam();
});

// 多队伍结果中的「应用该配置」：处理逻辑与「最优队伍构成」完全一致，
// 仅额外记录应用后的输入签名，使本次三态变更不触发结果重置
const applyMultiTeamConfiguration = (teamIndices: number[]) => {
  applyConfiguration(teamIndices);
  applySignatureSnapshot = algoSourceSignature.value;
};

const startMultiTeamCompute = () => {
  // 计算中再次点击 = 取消本次搜索
  if (multiTeamStatus.value === 'computing') {
    resetMultiTeam();
    return;
  }

  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return;

  const { activeUsers, mustIncludeMask, spellMasks } = buildAlgoInputData();
  const n = activeUsers.length;
  if (n > 30) {
    multiTeamStatus.value = 'error';
    multiTeamError.value = '参与计算的用户超过 30 人，多队伍分组暂不支持（位掩码上限）。';
    return;
  }

  resetMultiTeam();
  multiTeamStatus.value = 'computing';
  multiTeamTimer = setInterval(() => {
    multiTeamElapsed.value += 0.1;
  }, 100);

  multiTeamWorker = new PartyGroupingWorker();
  multiTeamWorker.onmessage = (e: MessageEvent) => {
    const msg = e.data as MultiTeamWorkerMessage | undefined;
    resetMultiTeam();
    if (msg && msg.type === 'done') {
      multiTeamResult.value = msg.result;
      multiTeamStatus.value = 'done';
    } else {
      multiTeamStatus.value = 'error';
      multiTeamError.value = (msg && msg.type === 'error' && msg.message) || '计算过程中出现未知错误。';
    }
  };
  multiTeamWorker.onerror = () => {
    resetMultiTeam();
    multiTeamStatus.value = 'error';
    multiTeamError.value = '计算线程启动失败，请刷新页面后重试。';
  };
  multiTeamWorker.postMessage({
    userCount: n,
    teamSize: targetM,
    spellMasks,
    mustIncludeMask,
    originalIndices: activeUsers.map((u) => u.originalIndex),
  });
};

onBeforeUnmount(() => {
  resetMultiTeam();
});

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-content party-modal slim-scrollbar">
          <button class="close-btn" @click="emit('close')" title="关闭弹窗">&times;</button>
          <h3>多人模式配置</h3>

          <div class="help-text">
            <p style="margin-bottom: 20px;">
              在此配置队伍成员<strong>未掌握</strong>的技能编号以开启共同学习。主用户（即“我”）默认为<strong>用户 1</strong>，主页的勾选记录的就是主用户的存档；点击各用户名右侧的「设为我」可随时切换主用户，切换后原用户的数据原地保留。<br />
              如果想指定某人<strong>必须参与</strong>最优组合计算，或顶替其隐藏，点击其名字右侧的
              <span class="eye-icon icon-visible inline-icon"></span>
              按钮切换状态。<br />
              （默认：可见参与计算；点一次：高亮且最优推荐必带；再点一次：隐藏不计入且该用户数据不再跟随主页改动）<br />
              当除用户1外文本框非空时，自动进入多人模式，恢复到单人模式仅需要清空其他用户文本框中的内容即可<br />
              （注：此功能尚在测试阶段，如果遇到问题可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
                rel="noopener noreferrer">点此反馈</a>）
            </p>

            <div @click="isAlgoExpanded = !isAlgoExpanded" class="filter-header">
              <span class="collapse-icon">{{ isAlgoExpanded ? '▼' : '▶' }}</span> 最优组队推荐
            </div>

            <div v-show="isAlgoExpanded" class="algo-content">
              <p>注：本功能用于连续学多人副本技能时，仅部分队员缺失的技能有重合的情况。会推荐重合范围最大的队员组合。</p>
              <div class="m-input-row">
                <label>队伍人数：</label>
                <input class="name-input m-input" type="number" v-model="m" min="1" max="8" placeholder="填入组队人数" />
              </div>

              <div v-if="m !== '' && bestParty" class="best-party-result">
                <template v-if="bestParty.maxCommonCount > 0">
                  <strong>最优队伍构成：</strong>
                  <div v-for="(teamIndices, teamIdx) in bestParty.allBestUsersIndices" :key="teamIdx" class="team-row">
                    <span v-if="teamIdx > 0" class="or-text">或</span>
                    <span v-for="idx in teamIndices" :key="idx" class="user-badge">
                      {{ displayName(idx) }}
                    </span>
                    <span class="apply-text" @click="applyConfiguration(teamIndices)" title="点击后将隐藏不在该配置中的其他队员">
                      应用该配置
                    </span>
                  </div>
                  <div class="spell-count-row">
                    <span class="spell-count">最多可共同学习的技能数：<span class="highlight">{{ bestParty.maxCommonCount }}</span>
                      个</span>
                  </div>
                </template>
                <template v-else>
                  <div class="no-skills-tips">当前可见分类下暂无可共同学习技能 (或强制限制导致无解)</div>
                </template>
              </div>

              <div class="multi-team-section">
                <div class="multi-team-title">多队伍组合推荐</div>
                <p class="multi-team-desc">
                  将全部参与用户一次性划分为尽可能多的满员队伍（人数不能整除时排除部分普通用户），在共同技能总量与队伍均衡之间取最优。人数较多时计算较慢，点击按钮开始。
                </p>
                <div class="multi-team-toolbar">
                  <button class="multi-team-btn" @click="startMultiTeamCompute" :disabled="m === ''">
                    {{ multiTeamStatus === 'computing' ? '取消计算' : (multiTeamStatus === 'done' ? '重新计算' : '开始计算') }}
                  </button>
                  <span v-if="m === ''" class="multi-team-hint">请先在上方填入队伍人数</span>
                  <span v-else-if="multiTeamStatus === 'computing'" class="multi-team-hint">
                    正在搜索最优分组…已耗时 {{ multiTeamElapsed.toFixed(1) }} 秒（再次点击按钮可取消）
                  </span>
                </div>

                <div v-if="multiTeamStatus === 'done' && multiTeamResult" class="multi-team-result">
                  <div v-for="(team, teamIdx) in multiTeamResult.teams" :key="teamIdx" class="multi-team-row">
                    <span class="multi-team-label">队伍{{ teamIdx + 1 }}</span>
                    <span v-for="idx in team.userIndices" :key="idx" class="user-badge">{{ displayName(idx) }}</span>
                    <span class="multi-team-colon">：</span>
                    <span class="spell-count">共可学习<span class="highlight">{{ team.commonSkillCount }}</span>个技能</span>
                    <span class="apply-text" @click="applyMultiTeamConfiguration(team.userIndices)"
                      title="点击后将隐藏不在该配置中的其他队员">应用该配置</span>
                  </div>
                  <div v-if="multiTeamResult.excludedUserIndices.length" class="multi-team-excluded">
                    排除：
                    <span v-for="idx in multiTeamResult.excludedUserIndices" :key="idx" class="user-badge excluded">{{ displayName(idx) }}</span>
                  </div>
                </div>
                <div v-else-if="multiTeamStatus === 'done' && !multiTeamResult" class="no-skills-tips">
                  无法完成完整分组：参与人数不足，或「必须参加」用户数超过所有队伍的总席位。
                </div>
                <div v-else-if="multiTeamStatus === 'error'" class="no-skills-tips">{{ multiTeamError }}</div>
              </div>
            </div>

            <div class="party-grid">

              <div class="party-user" :class="{ 'layer-hidden': localUser1VisibilityState === 2 }">
                <div class="name-row">
                  <input class="name-input" v-model="localUser1Name" :style="{ color: ensurePartyColor(0) }" :placeholder="mainUserSlot === 0 ? '用户 1 (我)' : '用户 1'" />
                  <span class="set-main-wrap" @mouseenter="showPreview(0, $event)" @mouseleave="schedulePreviewHide">
                    <button class="set-main-btn" :class="{ 'is-current': mainUserSlot === 0 }" :disabled="mainUserSlot === 0"
                      :aria-label="mainUserSlot === 0 ? '当前主用户' : '设为主用户'"
                      @click="setMainUser(0)">
                      <span class="icon-user"></span>
                    </button>
                  </span>
                  <label class="color-picker-btn" :style="{ color: ensurePartyColor(0) }" title="设置该用户名称颜色">
                    <span class="palette-icon icon-palette"></span>
                    <input class="color-input" type="color" :value="ensurePartyColor(0)" @input="setPartyColor(0, $event)" />
                  </label>
                  <button class="visibility-btn" :class="{ 'is-must-include': localUser1VisibilityState === 1 }"
                    @click="localUser1VisibilityState = (localUser1VisibilityState + 1) % 3"
                    :title="['该用户可见：参与计算，无限制', '该用户必须包含：最优队伍必带此人', '该用户隐藏：跳过该用户计算，主页改动不同步'][localUser1VisibilityState]">
                    <span class="eye-icon"
                      :class="localUser1VisibilityState === 2 ? 'icon-invisible' : 'icon-visible'"></span>
                  </button>
                </div>

                <div class="textarea-wrapper">
                  <textarea v-model.lazy="localUser1Spells" class="slim-scrollbar-sm" title="在此编辑或复制你未掌握的技能数据"
                    placeholder="填入未掌握技能编号..."></textarea>
                  <button class="copy-btn" @click="copyUser1Data" title="复制文本框内容">复制</button>
                  <Transition name="fade">
                    <div v-if="showCopyToast" class="copy-toast">复制成功</div>
                  </Transition>
                </div>
              </div>

              <div class="party-user" :class="{ 'layer-hidden': localPartyVisibilityStates[index] === 2 }"
                v-for="(data, index) in localPartyData" :key="index">
                <div class="name-row">
                  <input class="name-input" v-model="localPartyNames[index]" :style="{ color: ensurePartyColor(index + 1) }"
                    :placeholder="(index + 1 === mainUserSlot ? '用户 ' + (index + 2) + ' (我)' : '用户 ' + (index + 2))" />
                  <span class="set-main-wrap" @mouseenter="showPreview(index + 1, $event)" @mouseleave="schedulePreviewHide">
                    <button class="set-main-btn" :class="{ 'is-current': index + 1 === mainUserSlot }"
                      :disabled="index + 1 === mainUserSlot || !data.trim()"
                      :aria-label="index + 1 === mainUserSlot ? '当前主用户' : '设为主用户'"
                      @click="setMainUser(index + 1)"
                      :title="!data.trim() && index + 1 !== mainUserSlot ? '该用户没有数据，无法设为主用户' : undefined">
                      <span class="icon-user"></span>
                    </button>
                  </span>
                  <label class="color-picker-btn" :style="{ color: ensurePartyColor(index + 1) }" title="设置该用户名称颜色">
                    <span class="palette-icon icon-palette"><i></i><i></i><i></i><i></i></span>
                    <input class="color-input" type="color" :value="ensurePartyColor(index + 1)" @input="setPartyColor(index + 1, $event)" />
                  </label>
                  <button class="visibility-btn" :class="{ 'is-must-include': localPartyVisibilityStates[index] === 1 }"
                    @click="localPartyVisibilityStates[index] = (localPartyVisibilityStates[index] + 1) % 3"
                    :title="['该用户可见：参与计算，无限制', '该用户必须包含：最优队伍必带此人', '该用户隐藏：跳过该用户计算，主页改动不同步'][localPartyVisibilityStates[index]]">
                    <span class="eye-icon"
                      :class="localPartyVisibilityStates[index] === 2 ? 'icon-invisible' : 'icon-visible'"></span>
                  </button>

                  <button class="visibility-btn delete-btn" @click="removeTeammate(index)" title="移除该用户">
                    <span class="delete-icon">✖</span>
                  </button>
                </div>

                <textarea v-model.lazy="localPartyData[index]" class="slim-scrollbar-sm" placeholder="请粘贴其他用户分享的未掌握技能编号..."></textarea>
              </div>

              <div class="party-user action-buttons">
                <button class="action-btn add-btn" @click="addTeammate" title="增加一个队友位置">+ 新增用户</button>
              </div>
            </div>

            <div class="reset-wrap">
              <button class="reset-btn" @click="resetParty" title="清空用户2至20的所有名称和数据，恢复所有人默认可见，并切回用户 1">一键重置队友数据</button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 悬停预览面板：Teleport 到 body，避免被 party-modal 的 overflow 裁剪 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="previewData" ref="previewRef" class="spell-preview"
        :style="{ left: previewPos.x + 'px', top: previewPos.y + 'px' }"
        @mouseenter="cancelPreviewHide" @mouseleave="schedulePreviewHide">
        <div class="preview-header">
          <strong>{{ previewData.name }}</strong>
          <span>未掌握 {{ previewData.list.length }} 个技能</span>
        </div>
        <div v-if="previewData.list.length" class="preview-grid slim-scrollbar-sm">
          <div v-for="p in previewData.list" :key="p.no" class="preview-item">
            <img class="preview-icon" :src="p.icon" :srcset="p.srcset" :data-ck-action-id="p.action" />
            <span class="preview-no">No.{{ p.no }}</span>
            <span class="preview-name">{{ p.name }}</span>
          </div>
        </div>
        <div v-else class="preview-empty">该用户没有未掌握的技能</div>
        <div class="preview-hint">{{ previewData.isMain
          ? '该用户是当前主用户，主页勾选正在记录 TA 的存档'
          : '点击「设为我」后，主页勾选将改为记录该用户的存档' }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: #2c2c2c;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
  color: #e0e0e0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #ffbe31;
  padding-bottom: 10px;
  color: #ffbe31;
}

.help-text p {
  line-height: 1.6;
  margin: 15px 0;
}

.help-text a {
  color: #ffbe31;
  text-decoration: underline;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #ffbe31;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.party-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.party-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.party-user {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 5px;
}

.name-input {
  flex: 1;
  background: transparent;
  border: 1px dashed transparent;
  color: #ffbe31;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0 4px;
  border-radius: 4px;
  height: 28px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}

.name-input::placeholder {
  color: #aaa;
  font-weight: normal;
}

.name-input:hover,
.name-input:focus {
  border-color: #ffbe31;
  background: #2b2b2b;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.party-user textarea {
  width: 100%;
  box-sizing: border-box;
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
  min-height: 60px;
  font-family: monospace;
  font-size: 0.85rem;
}

.party-user textarea:focus {
  outline: none;
  border-color: #ffbe31;
}

.eye-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-color: currentColor;
}

.icon-visible {
  -webkit-mask: url('../assets/icons/Visible.svg') no-repeat center / contain;
  mask: url('../assets/icons/Visible.svg') no-repeat center / contain;
}

.icon-invisible {
  -webkit-mask: url('../assets/icons/Invisible.svg') no-repeat center / contain;
  mask: url('../assets/icons/Invisible.svg') no-repeat center / contain;
}

.inline-icon {
  vertical-align: middle;
  margin: 0 4px;
  position: relative;
  top: -2px;
  color: #ccc;
}

/* 用户名称颜色选择器（多人模式调色盘暂时隐藏） */
.color-picker-btn {
  position: relative;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: none;
  align-items: center;
  justify-content: center;
  color: #ccc;
  cursor: pointer;
  border-radius: 4px;
  transition: transform 0.2s, background-color 0.2s;
}

.color-picker-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.08);
}

.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.palette-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-color: currentColor;
}

.icon-palette {
  -webkit-mask: url('../assets/icons/palette.svg') no-repeat center / contain;
  mask: url('../assets/icons/palette.svg') no-repeat center / contain;
}

.visibility-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  opacity: 0.8;
  transition: all 0.2s;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visibility-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #ccc;
}

.visibility-btn.is-must-include {
  color: #ffbe31;
  opacity: 1;
}

/* --- 新增：设为主用户按钮（名字右侧，图标形态，无描边） --- */
.set-main-btn {
  background: transparent;
  border: none;
  color: #ccc;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.set-main-btn:hover:not(:disabled) {
  color: #ffbe31;
  transform: scale(1.1);
}

.set-main-btn.is-current {
  color: #ffbe31;
}

.set-main-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* user.svg：与 eye-icon 同款 mask 管线，剪影跟随 currentColor（灰 → 悬停金 → 当前金） */
.icon-user {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-color: currentColor;
  -webkit-mask: url('../assets/icons/user.svg') no-repeat center / contain;
  mask: url('../assets/icons/user.svg') no-repeat center / contain;
}

/* --- 新增：悬停预览（设为我按钮 → 该用户未掌握技能） --- */
.set-main-wrap {
  display: inline-flex;
}

.spell-preview {
  position: fixed;
  z-index: 2100; /* modal-backdrop(2000) 之上 */
  width: 430px;
  max-width: calc(100vw - 16px);
  background: #2c2c2c;
  border: 1px solid #ffbe31;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  padding: 10px 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  color: #ffbe31;
  font-size: 0.9rem;
}

.preview-header span {
  color: #aaa;
  font-size: 0.78rem;
  white-space: nowrap;
}

/* 双列紧凑网格：百余个技能单列滚动太长，两列密度与可读性平衡 */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 10px;
  max-height: 46vh;
  overflow-y: auto;
  padding-right: 4px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 0.78rem;
  color: #ddd;
  min-width: 0;
}

.preview-icon {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  flex: 0 0 22px;
}

.preview-no {
  color: #8a8a8a;
  font-size: 0.7rem;
  flex: 0 0 auto;
}

.preview-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-empty {
  color: #999;
  font-size: 0.85rem;
  padding: 4px 0;
}

.preview-hint {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 190, 49, 0.3);
  color: #888;
  font-size: 0.72rem;
  line-height: 1.4;
}

.layer-hidden {
  opacity: 0.55;
}

.layer-hidden .name-input {
  color: #777 !important;
}

.layer-hidden textarea {
  color: #777 !important;
  border-color: #333 !important;
}

.layer-hidden /* 用户名称颜色选择器（多人模式调色盘暂时隐藏） */
.color-picker-btn {
  position: relative;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: none;
  align-items: center;
  justify-content: center;
  color: #ccc;
  cursor: pointer;
  border-radius: 4px;
  transition: transform 0.2s, background-color 0.2s;
}

.color-picker-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.08);
}

.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.palette-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-color: currentColor;
}

.icon-palette {
  -webkit-mask: url('../assets/icons/palette.svg') no-repeat center / contain;
  mask: url('../assets/icons/palette.svg') no-repeat center / contain;
}

.visibility-btn {
  color: #777;
}

.copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #2b2b2b;
  color: #ffbe31;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  opacity: 0.7;
}

.copy-btn:hover {
  opacity: 1;
  background: #ffbe31;
  color: #1a1a1a;
  border-color: #ffbe31;
}

.copy-toast {
  position: absolute;
  top: 36px;
  right: 6px;
  background-color: #ffbe31;
  color: #1a1a1a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.reset-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reset-btn {
  background-color: transparent;
  color: #ffbe31;
  border: 1px solid #ffbe31;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #ffbe31;
  color: #1a1a1a;
}

.filter-header {
  font-size: 1rem;
  font-weight: bold;
  color: #ffbe31;
  cursor: pointer;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.filter-header:hover {
  opacity: 0.8;
}

.collapse-icon {
  display: inline-block;
  width: 16px;
  font-size: 0.8rem;
  color: #ffbe31;
}

.algo-content {
  margin-bottom: 20px;
  padding-left: 16px;
}

.m-input-row {
  display: flex;
  align-items: center;
}

.m-input-row label {
  font-weight: bold;
  color: #ffbe31;
  margin-right: 10px;
  font-size: 0.9rem;
}

.m-input {
  width: 150px;
  margin-bottom: 0;
  background: #2b2b2b;
  border: 1px solid #444;
}

.best-party-result {
  margin-top: 12px;
  font-size: 0.95rem;
  line-height: 2;
  border-top: 1px dashed rgba(255, 190, 49, 0.3);
  padding-top: 10px;
}

.no-skills-tips {
  color: #999;
  font-size: 0.95rem;
  margin-top: 5px;
}

.team-row {
  margin-top: 6px;
}

.or-text {
  color: #ccc;
  font-weight: bold;
  margin-right: 6px;
  font-size: 0.9rem;
}

.spell-count-row {
  margin-top: 6px;
}

.user-badge {
  display: inline-block;
  background: #ffbe31;
  color: #1a1a1a;
  padding: 2px 10px;
  border-radius: 12px;
  margin-right: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.spell-count {
  display: inline-block;
  margin-top: 5px;
  color: #ddd;
}

.highlight {
  color: #ffbe31;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0 4px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-height: 100px;
}

.action-btn {
  flex: 1;
  background: transparent;
  border: 1px dashed #444;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #2b2b2b;
}

.add-btn:hover {
  border-color: #ffbe31;
  color: #ffbe31;
}

.remove-btn:hover {
  border-color: #ff4c4c;
  color: #ff4c4c;
}

/* 新增：单用户删除按钮的样式 */
.delete-btn {
  color: #ff4c4c;
  font-size: 14px;
  margin-left: -2px; /* 拉近一点和可视按钮的距离 */
}
.delete-btn:hover {
  color: #ff4c4c;
}
.delete-icon {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

/* --- 新增：应用该配置文字按钮样式 --- */
.apply-text {
  font-size: 0.8rem;
  color: #ffbe31;
  opacity: 0.7;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: underline;
  transition: opacity 0.2s, color 0.2s;
  user-select: none;
}

.apply-text:hover {
  opacity: 1;
  color: #ffffff;
}

/* --- 新增：多队伍组合推荐 --- */
.multi-team-section {
  margin-top: 12px;
  font-size: 0.95rem;
  line-height: 2;
  border-top: 1px dashed rgba(255, 190, 49, 0.3);
  padding-top: 10px;
}

.multi-team-title {
  color: #ffbe31;
  font-weight: bold;
}

.multi-team-desc {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 4px 0;
}

.multi-team-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.multi-team-btn {
  background: transparent;
  border: 1px solid #ffbe31;
  color: #ffbe31;
  border-radius: 4px;
  padding: 4px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s;
}

.multi-team-btn:hover:not(:disabled) {
  background: rgba(255, 190, 49, 0.15);
}

.multi-team-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.multi-team-hint {
  color: #999;
  font-size: 0.85rem;
}

.multi-team-result {
  margin-top: 8px;
}

.multi-team-row {
  margin-top: 6px;
}

.multi-team-label {
  color: #ffbe31;
  font-weight: bold;
  margin-right: 6px;
}

.multi-team-colon {
  color: #ccc;
  margin: 0 4px;
}

.multi-team-excluded {
  margin-top: 6px;
  color: #ddd;
}

.user-badge.excluded {
  background: #555;
  color: #ccc;
}

</style>