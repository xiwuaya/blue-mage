<script setup lang="ts">
import { ref, watch, computed } from 'vue';

// ==========================================
// 1. 属性接收与事件定义 (与父组件双向绑定)
// ==========================================
const props = defineProps<{
  show: boolean;           // 控制弹窗显示
  user1Spells: string;     // 用户1的未掌握技能数据
  user1Name: string;       // 用户1的自定义名称
  partyData: string[];     // 队友的未掌握技能数据 (数组长度为7)
  partyNames: string[];    // 队友的自定义名称 (数组长度为7)
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:user1Spells', val: string): void;
  (e: 'update:user1Name', val: string): void;
  (e: 'update:partyData', val: string[]): void;
  (e: 'update:partyNames', val: string[]): void;
}>();

// ==========================================
// 2. 本地状态管理
// ==========================================
// 队伍期望组队人数 m，默认为空
const m = ref<number | "">("");

// 创建本地 ref 以便在组件内双向绑定，同时避免直接修改 props
const localUser1Spells = ref(props.user1Spells);
const localUser1Name = ref(props.user1Name);
const localPartyData = ref([...props.partyData]);
const localPartyNames = ref([...props.partyNames]);

// 监听本地数据的变化，并通过 emit 同步给父组件 (App.vue)，触发本地存储更新
watch(localUser1Spells, (val) => emit('update:user1Spells', val));
watch(localUser1Name, (val) => emit('update:user1Name', val));
watch(localPartyData, (val) => emit('update:partyData', val), { deep: true });
watch(localPartyNames, (val) => emit('update:partyNames', val), { deep: true });

// 监听父组件的数据变化，同步到本地 (比如在 App.vue 侧边栏勾选了技能时)
watch(() => props.user1Spells, (val) => localUser1Spells.value = val);
watch(() => props.user1Name, (val) => localUser1Name.value = val);
watch(() => props.partyData, (val) => localPartyData.value = [...val], { deep: true });
watch(() => props.partyNames, (val) => localPartyNames.value = [...val], { deep: true });

// ==========================================
// 3. 核心功能函数
// ==========================================

// 一键复制用户 1 的未掌握技能数据
const copyUser1Data = async () => {
  try {
    // 优先使用现代浏览器的剪贴板 API
    await navigator.clipboard.writeText(localUser1Spells.value);
    alert("已成功复制！");
  } catch (err) {
    // 降级处理：兼容不支持 Clipboard API 的老旧或未开启 HTTPS 的浏览器环境
    const textArea = document.createElement("textarea");
    textArea.value = localUser1Spells.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("已成功复制！");
  }
};

// 一键重置队友数据 (仅重置用户 2-8 的数据和名字，保留用户 1)
const resetParty = () => {
  localPartyData.value = Array(7).fill("");
  localPartyNames.value = Array(7).fill("");
};

// ==========================================
// 4. 最优组队算法 (状态压缩 + 暴力枚举)
// ==========================================
const bestParty = computed(() => {
  // 解析期望人数 m
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  // 如果输入的 m 不合法或不在 1-8 范围内，直接跳过计算
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

  const n = 8; // 最大参与计算的总用户数
  const usersSets: Set<number>[] = [];

  // 解析并存入 用户 1 的未掌握技能集合
  const u1Nums = localUser1Spells.value.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
  usersSets.push(new Set(u1Nums));

  // 解析并存入 用户 2-8 的未掌握技能集合
  for (let i = 0; i < 7; i++) {
    const str = localPartyData.value[i] || "";
    if (str.trim()) {
      const nums = str.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
      usersSets.push(new Set(nums));
    } else {
      usersSets.push(new Set()); // 如果该队友框内为空，视作没有未掌握技能
    }
  }

  // 步骤 1. 计算每个技能的 SpellMask (二进制状态压缩)
  // 如果技能被用户 i 未掌握，则将该技能 Mask 的第 i 位置为 1
  const spellMasks = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    for (const spellNo of usersSets[i]) {
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i)); 
    }
  }

  // 步骤 2. 找到所有正好包含 m 个人 (即二进制有 m 个 1) 的队伍组合 PartyMask
  const partyMasks = [];
  for (let i = 1; i < (1 << n); i++) {
    let countOnes = 0;
    for (let j = 0; j < n; j++) {
      if ((i & (1 << j)) !== 0) countOnes++;
    }
    if (countOnes === targetM) {
      partyMasks.push(i);
    }
  }

  // 步骤 3. 评估所有合法的队伍组合，用位运算快速筛选交集最大的队伍
  let maxCommonCount = -1;
  let bestPartyMask = 0;

  for (const pMask of partyMasks) {
    let currentCommonCount = 0;
    for (const sMask of spellMasks.values()) {
      // 核心算法判定：当某技能的掩码(sMask)和队伍掩码(pMask)按位与之后等于队伍掩码自身时
      // 代表这个队伍里每一位玩家的对应位上都是 1，即所有人都没有掌握该技能！
      if ((sMask & pMask) === pMask) {
        currentCommonCount++;
      }
    }
    if (currentCommonCount > maxCommonCount) {
      maxCommonCount = currentCommonCount;
      bestPartyMask = pMask;
    }
  }

  if (maxCommonCount === -1) return null;

  // 步骤 4. 将寻找到的最优二进制队伍掩码还原为可视的用户索引
  const bestUsersIndices = [];
  for (let i = 0; i < n; i++) {
    if ((bestPartyMask & (1 << i)) !== 0) {
      bestUsersIndices.push(i);
    }
  }

  return {
    bestUsersIndices,
    maxCommonCount
  };
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
              在其他用户的框中粘贴他人分享的编号数据（按逗号或空格分隔均可），系统会自动计算各个技能的未掌握人数，并允许依据未掌握人数在列表中过滤与排序。
            </p>

            <div class="m-config-container">
              <div class="m-input-row">
                <label>队伍人数：</label>
                <input 
                  class="name-input m-input" 
                  type="number" 
                  v-model="m" 
                  min="1" 
                  max="8" 
                  placeholder="填入组队人数 m..." 
                />
              </div>
              
              <div v-if="m !== '' && bestParty" class="best-party-result">
                <strong>最优队伍构成：</strong>
                <span v-for="idx in bestParty.bestUsersIndices" :key="idx" class="user-badge">
                  {{ idx === 0 ? (localUser1Name || '用户 1 (我)') : (localPartyNames[idx - 1] || `用户 ${idx + 1}`) }}
                </span>
                <br />
                <span class="spell-count">最多可共同学习的技能数：<span class="highlight">{{ bestParty.maxCommonCount }}</span> 个</span>
              </div>
            </div>

            <div class="party-grid">
              <div class="party-user">
                <input class="name-input" v-model="localUser1Name" placeholder="用户 1 (我)" />
                <div class="textarea-wrapper">
                  <textarea 
                    v-model.lazy="localUser1Spells" 
                    title="在此编辑或复制你未掌握的技能数据" 
                    placeholder="填入未掌握技能编号..."
                  ></textarea>
                  <button class="copy-btn" @click="copyUser1Data" title="复制文本框内容">复制</button>
                </div>
              </div>

              <div class="party-user" v-for="i in 7" :key="i">
                <input class="name-input" v-model="localPartyNames[i-1]" :placeholder="'用户 ' + (i + 1)" />
                <textarea 
                  v-model.lazy="localPartyData[i-1]" 
                  placeholder="请粘贴其他用户分享的未掌握技能编号..."
                ></textarea>
              </div>
            </div>
            
            <div class="reset-wrap">
              <button class="reset-btn" @click="resetParty" title="清空用户2至8的所有名称和数据">一键重置队友数据</button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* -------------------------------------
   弹窗整体样式
------------------------------------- */
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

/* 关闭按钮样式 */
.close-btn {
  position: absolute; 
  top: 10px; 
  right: 15px; 
  background: none; 
  border: none; 
  color: #ccc; 
  font-size: 1.5rem; 
  cursor: pointer; 
  transition: color 0.2s;
}
.close-btn:hover { 
  color: #ffbe31; 
}

/* 弹窗过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* -------------------------------------
   组队配置网格样式
------------------------------------- */
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
}

/* 自定义名称输入框 */
.name-input {
  margin-bottom: 5px; 
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
  transition: border-color 0.2s; 
  outline: none;
}
.name-input:hover, .name-input:focus { 
  border-color: #ffbe31; 
  background: #2b2b2b; 
}

/* 文本框包裹容器与复制按钮 */
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
  transition: all 0.2s;
}
.copy-btn:hover {
  opacity: 1;
  background: #ffbe31;
  color: #1a1a1a;
  border-color: #ffbe31;
}

/* 一键重置按钮 */
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

/* -------------------------------------
   算法运算结果展示区样式
------------------------------------- */
.m-config-container {
  background: rgba(255, 190, 49, 0.1); 
  border-left: 4px solid #ffbe31; 
  padding: 15px; 
  margin-bottom: 20px; 
  border-radius: 4px;
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
</style>
