<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { spells } from '@/lib/spell';
import type { FilterTypes } from '@/lib/interface';

// ==========================================
// 1. 属性接收与事件定义 
// ==========================================
const props = defineProps<{
  show: boolean;
  user1Spells: string;
  user1Name: string;
  partyData: string[];
  partyNames: string[];
  filterTypes: FilterTypes;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:user1Spells', val: string): void;
  (e: 'update:user1Name', val: string): void;
  (e: 'update:partyData', val: string[]): void;
  (e: 'update:partyNames', val: string[]): void;
  (e: 'resetMinUnlearned'): void;
}>();

// ==========================================
// 2. 本地状态管理
// ==========================================
const m = ref<number | "">("");
const isAlgoExpanded = ref(false);

const showCopyToast = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const localUser1Spells = ref(props.user1Spells);
const localUser1Name = ref(props.user1Name);
const localPartyData = ref([...props.partyData]);
const localPartyNames = ref([...props.partyNames]);

// --- 修改：将原本的 Boolean 类型变为 0, 1, 2 三种状态 ---
// 0: 默认可见 (参与计算，无限制)
// 1: 高亮可见 (必定包含在最优队伍中)
// 2: 不可见 (隐藏跳过，完全不计算该用户)
const user1VisibilityState = ref<number>(0);
const partyVisibilityStates = ref<number[]>(Array(localPartyData.value.length).fill(0));

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

// ==========================================
// 3. 核心功能函数
// ==========================================
const triggerToast = () => {
  showCopyToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showCopyToast.value = false;
  }, 2000); 
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

const resetParty = () => {
  const len = localPartyData.value.length;
  localPartyData.value = Array(len).fill("");
  localPartyNames.value = Array(len).fill("");
  partyVisibilityStates.value = Array(len).fill(0); // 重置为默认可见
  emit('resetMinUnlearned');
};

const addTeammate = () => {
  if (localPartyData.value.length >= 23) {
    alert("为保证页面计算流畅，最多支持添加 23 名队友哦！");
    return;
  }
  localPartyData.value.push("");
  localPartyNames.value.push("");
  partyVisibilityStates.value.push(0); // 新加队友默认可见
};

const removeTeammate = () => {
  if (localPartyData.value.length > 0) {
    localPartyData.value.pop();
    localPartyNames.value.pop();
    partyVisibilityStates.value.pop(); 
  }
};

const getFilterKey = (type: string): keyof FilterTypes => {
  if (type === 'fate' || type === 'hunt' || type === 'treasure' || type === 'guildhests') return 'other';
  if (type === 'special') return 'carnivale';
  return type as keyof FilterTypes;
};

// ==========================================
// 4. 最优组队算法 (结合过滤、动态人数与图层可见性及强制要求)
// ==========================================
const bestParty = computed(() => {
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

  // --- 修改：构建活跃用户池，同时记录必定包含的掩码位 ---
  const activeUsers: { originalIndex: number, spellSet: Set<number> }[] = [];
  let mustIncludeMask = 0;
  let activeIndex = 0;

  if (user1VisibilityState.value !== 2) {
    const u1Nums = localUser1Spells.value.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
    activeUsers.push({ originalIndex: 0, spellSet: new Set(u1Nums) });
    // 如果状态为 1（必带），记录掩码位
    if (user1VisibilityState.value === 1) {
      mustIncludeMask |= (1 << activeIndex);
    }
    activeIndex++;
  }

  for (let i = 0; i < localPartyData.value.length; i++) {
    if (partyVisibilityStates.value[i] !== 2) {
      const str = localPartyData.value[i] || "";
      if (str.trim()) {
        const nums = str.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
        activeUsers.push({ originalIndex: i + 1, spellSet: new Set(nums) });
      } else {
        activeUsers.push({ originalIndex: i + 1, spellSet: new Set() });
      }
      
      // 如果状态为 1（必带），记录掩码位
      if (partyVisibilityStates.value[i] === 1) {
        mustIncludeMask |= (1 << activeIndex);
      }
      activeIndex++;
    }
  }

  const n = activeUsers.length; 
  
  // 计算当前“必须包含”的总人数
  let tempMask = mustIncludeMask;
  let mustIncludeCount = 0;
  while (tempMask > 0) {
    mustIncludeCount += tempMask & 1;
    tempMask >>= 1;
  }

  // 如果当前选为可见的总人数不够，或要求必带的人数大于期望队伍人数，直接跳过计算
  if (n < targetM || mustIncludeCount > targetM) return null; 

  const validSpellNos = new Set<number>();
  for (const spell of spells) {
    const isValid = spell.method.some((m) => props.filterTypes[getFilterKey(m.type)]);
    if (isValid) validSpellNos.add(Number(spell.no));
  }

  // 生成活跃用户的掩码
  const spellMasks = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    for (const spellNo of activeUsers[i].spellSet) {
      if (!validSpellNos.has(spellNo)) continue;
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i)); 
    }
  }

  const partyMasks = [];
  
  // 使用 Gosper's Hack 生成组合掩码
  if (targetM <= n) {
    let state = (1 << targetM) - 1; 
    const limit = 1 << n;     

    while (state < limit) {
      // --- 核心限制逻辑：只有在这个组合位掩码 完美包含 必须包含掩码位 时，才是合格的组合 ---
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
              在此配置队伍成员<strong>未掌握</strong>的技能编号以开启共同学习。<strong>用户 1</strong> 默认为当前使用者，请直接复制框内数据分享给其他队员。<br/>
              如果想指定某人<strong>必须参与</strong>最优组合计算，或<strong>临时剔除</strong>某人计算，点击其名字右侧的 
              <span class="eye-icon icon-visible inline-icon"></span> 
              按钮切换状态。<br/>
              （默认：可见参与计算；点一次：高亮且必定包含此人；再点一次：完全隐藏不计算）<br/>
              当除用户1外文本框非空时，自动进入多人模式，恢复到单人模式仅需要清空其他用户文本框中的内容即可<br/>
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
                <input 
                  class="name-input m-input" 
                  type="number" 
                  v-model="m" 
                  min="1" 
                  max="8" 
                  placeholder="填入组队人数" 
                />
              </div>
              
              <div v-if="m !== '' && bestParty" class="best-party-result">
                <template v-if="bestParty.maxCommonCount > 0">
                  <strong>最优队伍构成：</strong>
                  <div 
                    v-for="(teamIndices, teamIdx) in bestParty.allBestUsersIndices" 
                    :key="teamIdx" 
                    class="team-row"
                  >
                    <span v-if="teamIdx > 0" class="or-text">或</span>
                    <span v-for="idx in teamIndices" :key="idx" class="user-badge">
                      {{ idx === 0 ? (localUser1Name || '用户 1 (我)') : (localPartyNames[idx - 1] || `用户 ${idx + 1}`) }}
                    </span>
                  </div>
                  <div class="spell-count-row">
                    <span class="spell-count">最多可共同学习的技能数：<span class="highlight">{{ bestParty.maxCommonCount }}</span> 个</span>
                  </div>
                </template>
                <template v-else>
                  <div class="no-skills-tips">当前可见分类下暂无可共同学习技能 (或强制人数大于上限)</div>
                </template>
              </div>
            </div>

            <div class="party-grid">
              
              <div class="party-user" :class="{ 'layer-hidden': user1VisibilityState === 2 }">
                <div class="name-row">
                  <input class="name-input" v-model="localUser1Name" placeholder="用户 1 (我)" />
                  <button 
                    class="visibility-btn" 
                    :class="{ 'is-must-include': user1VisibilityState === 1 }"
                    @click="user1VisibilityState = (user1VisibilityState + 1) % 3" 
                    :title="['该用户可见：参与计算，无限制', '该用户必须包含：最优队伍必带此人', '该用户隐藏：跳过该用户计算'][user1VisibilityState]"
                  >
                    <span class="eye-icon" :class="user1VisibilityState === 2 ? 'icon-invisible' : 'icon-visible'"></span>
                  </button>
                </div>
                
                <div class="textarea-wrapper">
                  <textarea 
                    v-model.lazy="localUser1Spells" 
                    title="在此编辑或复制你未掌握的技能数据" 
                    placeholder="填入未掌握技能编号..."
                  ></textarea>
                  <button class="copy-btn" @click="copyUser1Data" title="复制文本框内容">复制</button>
                  <Transition name="fade">
                    <div v-if="showCopyToast" class="copy-toast">复制成功</div>
                  </Transition>
                </div>
              </div>

              <div class="party-user" :class="{ 'layer-hidden': partyVisibilityStates[index] === 2 }" v-for="(data, index) in localPartyData" :key="index">
                <div class="name-row">
                  <input class="name-input" v-model="localPartyNames[index]" :placeholder="'用户 ' + (index + 2)" />
                  <button 
                    class="visibility-btn" 
                    :class="{ 'is-must-include': partyVisibilityStates[index] === 1 }"
                    @click="partyVisibilityStates[index] = (partyVisibilityStates[index] + 1) % 3" 
                    :title="['该用户可见：参与计算，无限制', '该用户必须包含：最优队伍必带此人', '该用户隐藏：跳过该用户计算'][partyVisibilityStates[index]]"
                  >
                    <span class="eye-icon" :class="partyVisibilityStates[index] === 2 ? 'icon-invisible' : 'icon-visible'"></span>
                  </button>
                </div>
                
                <textarea 
                  v-model.lazy="localPartyData[index]" 
                  placeholder="请粘贴其他用户分享的未掌握技能编号..."
                ></textarea>
              </div>

              <div class="party-user action-buttons">
                <button class="action-btn add-btn" @click="addTeammate" title="增加一个队友位置">+ 新增用户</button>
                <button 
                  v-if="localPartyData.length > 0" 
                  class="action-btn remove-btn" 
                  @click="removeTeammate" 
                  title="移除最后一个队友位置"
                >- 移除用户</button>
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
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 2000;
}
.modal-content {
  background-color: #2c2c2c; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px;
  position: relative; color: #e0e0e0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); border: 1px solid #444;
}
.modal-content h3 {
  margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #ffbe31; padding-bottom: 10px; color: #ffbe31;
}
.help-text p { line-height: 1.6; margin: 15px 0; }
.help-text a {
  color: #ffbe31;
  text-decoration: underline;
}
.close-btn {
  position: absolute; top: 10px; right: 15px; background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; transition: color 0.2s;
}
.close-btn:hover { color: #ffbe31; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.party-modal { max-width: 800px; max-height: 90vh; overflow-y: auto; }
.party-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
.party-user { display: flex; flex-direction: column; transition: all 0.3s ease; }

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 5px;
}
.visibility-btn {
  background: transparent; border: none; cursor: pointer; font-size: 1.1rem;
  padding: 0 2px; opacity: 0.6; transition: opacity 0.2s, transform 0.2s; outline: none;
}
.visibility-btn:hover { opacity: 1; transform: scale(1.1); }

.name-input {
  flex: 1; 
  background: transparent; border: 1px dashed transparent; color: #ffbe31; font-size: 0.9rem; font-weight: bold;
  padding: 0 4px; border-radius: 4px; height: 28px; width: 100%; box-sizing: border-box; transition: color 0.2s, border-color 0.2s; outline: none;
}
.name-input::placeholder { color: #aaa; font-weight: normal; }
.name-input:hover, .name-input:focus { border-color: #ffbe31; background: #2b2b2b; }

.textarea-wrapper { position: relative; width: 100%; display: flex; flex-direction: column; }
.party-user textarea {
  width: 100%; box-sizing: border-box; background: #1a1a1a; color: #fff; border: 1px solid #444;
  border-radius: 4px; padding: 8px; resize: vertical; min-height: 60px; font-family: monospace; font-size: 0.85rem; transition: color 0.2s, border-color 0.2s;
}
.party-user textarea:focus { outline: none; border-color: #ffbe31; }

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 5px;
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

.visibility-btn {
  background: transparent; 
  border: none; 
  cursor: pointer; 
  padding: 4px; 
  color: #ccc; 
  opacity: 0.8; 
  transition: opacity 0.2s, transform 0.2s, color 0.2s; 
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.visibility-btn:hover { 
  opacity: 1; 
  transform: scale(1.1); 
  color: #ffbe31; 
}

/* --- 新增：持久的高亮状态，表示该名队员必带 --- */
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
.layer-hidden .visibility-btn {
  color: #777; 
}

.copy-btn {
  position: absolute; top: 6px; right: 6px; background: #2b2b2b; color: #ffbe31; border: 1px solid #444;
  border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; font-weight: bold; cursor: pointer; opacity: 0.7; transition: all 0.2s;
}
.copy-btn:hover { opacity: 1; background: #ffbe31; color: #1a1a1a; border-color: #ffbe31; }

.copy-toast {
  position: absolute; top: 36px; right: 6px; background-color: #ffbe31; color: #1a1a1a; padding: 4px 8px;
  border-radius: 4px; font-size: 0.75rem; font-weight: bold; pointer-events: none; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); z-index: 10;
}

.reset-wrap { margin-top: 20px; display: flex; justify-content: flex-end; }
.reset-btn {
  background-color: transparent; color: #ffbe31; border: 1px solid #ffbe31; border-radius: 4px;
  padding: 6px 16px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
}
.reset-btn:hover { background-color: #ffbe31; color: #1a1a1a; }

.filter-header {
  font-size: 1rem; font-weight: bold; color: #ffbe31; cursor: pointer; margin-bottom: 10px; transition: opacity 0.2s; display: flex; align-items: center;
}
.filter-header:hover { opacity: 0.8; }
.collapse-icon { display: inline-block; width: 16px; font-size: 0.8rem; color: #ffbe31; }
.algo-content { margin-bottom: 20px; padding-left: 16px; }

.m-input-row { display: flex; align-items: center; }
.m-input-row label { font-weight: bold; color: #ffbe31; margin-right: 10px; font-size: 0.9rem; }
.m-input { width: 150px; margin-bottom: 0; background: #2b2b2b; border: 1px solid #444; }

.best-party-result { 
  margin-top: 12px; font-size: 0.95rem; line-height: 2; border-top: 1px dashed rgba(255, 190, 49, 0.3); padding-top: 10px;
}
.no-skills-tips { color: #999; font-size: 0.95rem; margin-top: 5px; }
.team-row { margin-top: 6px; }
.or-text { color: #ccc; font-weight: bold; margin-right: 6px; font-size: 0.9rem; }
.spell-count-row { margin-top: 6px; }

.user-badge {
  display: inline-block; background: #ffbe31; color: #1a1a1a; padding: 2px 10px; border-radius: 12px; margin-right: 6px; font-size: 0.8rem; font-weight: bold;
}
.spell-count { display: inline-block; margin-top: 5px; color: #ddd; }
.highlight { color: #ffbe31; font-weight: bold; font-size: 1.1rem; margin: 0 4px; }

.action-buttons { display: flex; flex-direction: column; justify-content: center; gap: 10px; min-height: 100px; }
.action-btn { 
  flex: 1; background: transparent; border: 1px dashed #444; color: #ccc; 
  border-radius: 4px; cursor: pointer; font-size: 0.9rem; font-weight: bold; transition: all 0.2s; 
}
.action-btn:hover { background: #2b2b2b; }
.add-btn:hover { border-color: #ffbe31; color: #ffbe31; }
.remove-btn:hover { border-color: #ff4c4c; color: #ff4c4c; }
</style>