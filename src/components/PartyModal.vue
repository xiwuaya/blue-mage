<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { spells } from '@/lib/spell';
import type { FilterTypes } from '@/lib/interface';

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
  "#FF4D4D", "#4D8DFF", "#52D273", "#FFD43B", "#B86BFF", "#FF8C42",
  "#24C6C8", "#FF5C93", "#7AA7FF", "#A8D83E", "#8E6CFF", "#E85D04",
  "#00A878", "#D94F70", "#1E9BDE", "#C4E538", "#6C4DDC", "#F5A623",
  "#008F8C", "#C73665", "#356AE6", "#7CB342", "#9B51E0", "#E76F51"
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
  // const len = localPartyData.value.length;
  const len = 3;
  localPartyData.value = Array(len).fill("");
  localPartyNames.value = Array(len).fill("");
  localPartyColors.value = Array.from({ length: len + 1 }, (_, index) => getDefaultPartyColor(index));
  localPartyVisibilityStates.value = Array(len).fill(0); // 重置时恢复为默认可见状态
  emit('resetMinUnlearned');
};

const addTeammate = () => {
  if (localPartyData.value.length >= 23) {
    alert("为保证页面计算流畅，最多支持添加 23 名队友哦！");
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


// ==========================================
// 4. 最优组队算法 (精准筛选三态组合)
// ==========================================
const bestParty = computed(() => {
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

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

  const n = activeUsers.length;

  let tempMask = mustIncludeMask;
  let mustIncludeCount = 0;
  while (tempMask > 0) {
    mustIncludeCount += tempMask & 1;
    tempMask >>= 1;
  }

  if (n < targetM || mustIncludeCount > targetM) return null;

  const validSpellNos = new Set<number>();
  for (const spell of spells) {
    const isValid = spell.method.some((m) => props.filterTypes[getFilterKey(m)]);
    if (isValid) validSpellNos.add(Number(spell.no));
  }

  const spellMasks = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    for (const spellNo of activeUsers[i].spellSet) {
      if (!validSpellNos.has(spellNo)) continue;
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i));
    }
  }

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
const applyConfiguration = (teamIndices: number[]) => {
  // 1. 处理用户 1：如果在选中的队伍中(0)，设为可见(0)；否则设为隐藏(2)
  if (teamIndices.includes(0)) {
    if (localUser1VisibilityState.value === 2) {
      localUser1VisibilityState.value = 0;
    }
  } else {
    localUser1VisibilityState.value = 2;
  }

  // 2. 处理其他队员
  for (let i = 0; i < localPartyData.value.length; i++) {
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

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-content party-modal">
          <button class="close-btn" @click="emit('close')" title="关闭弹窗">&times;</button>
          <h3>多人模式配置</h3>

          <div class="help-text">
            <p style="margin-bottom: 20px;">
              在此配置队伍成员<strong>未掌握</strong>的技能编号以开启共同学习。<strong>用户 1</strong> 默认为当前使用者，请直接复制框内数据分享给其他队员。<br />
              如果想指定某人<strong>必须参与</strong>最优组合计算，或顶替其隐藏，点击其名字右侧的
              <span class="eye-icon icon-visible inline-icon"></span>
              按钮切换状态。<br />
              （默认：可见参与计算；点一次：高亮且最优推荐必带；再点一次：隐藏不计入且主页改动不连动）<br />
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
                      {{ idx === 0 ? (localUser1Name || '用户 1 (我)') : (localPartyNames[idx - 1] || `用户 ${idx + 1}`) }}
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
            </div>

            <div class="party-grid">

              <div class="party-user" :class="{ 'layer-hidden': localUser1VisibilityState === 2 }">
                <div class="name-row">
                  <input class="name-input" v-model="localUser1Name" :style="{ color: ensurePartyColor(0) }" placeholder="用户 1 (我)" />
                  <label class="color-picker-btn" :style="{ color: ensurePartyColor(0) }" title="设置该用户名称颜色">
                    <span class="palette-icon"><i></i><i></i><i></i><i></i></span>
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
                  <textarea v-model.lazy="localUser1Spells" title="在此编辑或复制你未掌握的技能数据"
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
                  <input class="name-input" v-model="localPartyNames[index]" :style="{ color: ensurePartyColor(index + 1) }" :placeholder="'用户 ' + (index + 2)" />
                  <label class="color-picker-btn" :style="{ color: ensurePartyColor(index + 1) }" title="设置该用户名称颜色">
                    <span class="palette-icon"><i></i><i></i><i></i><i></i></span>
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

                <textarea v-model.lazy="localPartyData[index]" placeholder="请粘贴其他用户分享的未掌握技能编号..."></textarea>
              </div>

              <div class="party-user action-buttons">
                <button class="action-btn add-btn" @click="addTeammate" title="增加一个队友位置">+ 新增用户</button>
              </div>
            </div>

            <div class="reset-wrap">
              <button class="reset-btn" @click="resetParty" title="清空用户2至8的所有名称和数据，并恢复所有人默认可见">一键重置队友数据</button>
            </div>

          </div>
        </div>
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
  -webkit-mask: url('/icons/Visible.svg') no-repeat center / contain;
  mask: url('/icons/Visible.svg') no-repeat center / contain;
}

.icon-invisible {
  -webkit-mask: url('/icons/Invisible.svg') no-repeat center / contain;
  mask: url('/icons/Invisible.svg') no-repeat center / contain;
}

.inline-icon {
  vertical-align: middle;
  margin: 0 4px;
  position: relative;
  top: -2px;
  color: #ccc;
}

/* 用户名称颜色选择器 */
.color-picker-btn {
  position: relative;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: flex;
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
  width: 17px;
  height: 17px;
  position: relative;
  display: block;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
}

.palette-icon::before {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 7px 0 0 currentColor, 3.5px 7px 0 currentColor;
}

.palette-icon::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  right: -2px;
  bottom: 1px;
  border-radius: 50%;
  background: #2c2c2c;
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

.layer-hidden /* 用户名称颜色选择器 */
.color-picker-btn {
  position: relative;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  display: flex;
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
  width: 17px;
  height: 17px;
  position: relative;
  display: block;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
}

.palette-icon::before {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 7px 0 0 currentColor, 3.5px 7px 0 currentColor;
}

.palette-icon::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  right: -2px;
  bottom: 1px;
  border-radius: 50%;
  background: #2c2c2c;
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

</style>