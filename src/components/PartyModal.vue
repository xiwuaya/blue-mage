<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  show: boolean;
  user1Spells: string;
  partyData: string[];
  partyNames: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:user1Spells', val: string): void;
  (e: 'update:partyData', val: string[]): void;
  (e: 'update:partyNames', val: string[]): void;
}>();

// --- 队伍人数输入框绑定的状态 ---
const m = ref<number | "">("");

// --- 内部状态，用来与 App.vue 父组件双向绑定 ---
const localUser1Spells = ref(props.user1Spells);
const localPartyData = ref([...props.partyData]);
const localPartyNames = ref([...props.partyNames]);

watch(localUser1Spells, (val) => emit('update:user1Spells', val));
watch(localPartyData, (val) => emit('update:partyData', val), { deep: true });
watch(localPartyNames, (val) => emit('update:partyNames', val), { deep: true });

watch(() => props.user1Spells, (val) => localUser1Spells.value = val);
watch(() => props.partyData, (val) => localPartyData.value = [...val], { deep: true });
watch(() => props.partyNames, (val) => localPartyNames.value = [...val], { deep: true });

// --- 核心：状态压缩结合暴力枚举的最优组队算法 ---
const bestParty = computed(() => {
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  // 如果输入的 m 不合法或不在 1-8 范围内，直接跳过计算
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

  const n = 8; // 最大 8 个用户
  const usersSets: Set<number>[] = [];

  // 用户 1 的未掌握技能
  const u1Nums = localUser1Spells.value.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
  usersSets.push(new Set(u1Nums));

  // 用户 2-8 的未掌握技能
  for (let i = 0; i < 7; i++) {
    const str = localPartyData.value[i] || "";
    if (str.trim()) {
      const nums = str.split(/[,，\s]+/).map(Number).filter(x => !isNaN(x));
      usersSets.push(new Set(nums));
    } else {
      usersSets.push(new Set()); // 空数据视作没有未掌握的技能
    }
  }

  // 1. 计算每个技能的 SpellMask (二进制状态压缩)
  const spellMasks = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    for (const spellNo of usersSets[i]) {
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i)); // 第 i 位置为 1
    }
  }

  // 2. 找到所有正好包含 m 个人 (即 m 个 1) 的队伍掩码 PartyMask
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

  // 3. 评估所有合法的队伍，用位运算快速筛选交集最大的队伍
  let maxCommonCount = -1;
  let bestPartyMask = 0;

  for (const pMask of partyMasks) {
    let currentCommonCount = 0;
    for (const sMask of spellMasks.values()) {
      // 核心判定：当该技能掩码完全覆盖队伍掩码时，说明这 m 个人都没掌握
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

  // 4. 将二进制队伍掩码还原为用户索引
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

// --- 一键重置队友数据 ---
const resetParty = () => {
  localPartyData.value = Array(7).fill("");
  localPartyNames.value = Array(7).fill("");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-content party-modal">
          <button class="close-btn" @click="emit('close')">&times;</button>
          <h3>多人模式配置</h3>
          <div class="help-text">
            <p style="margin-bottom: 20px;">
              在此配置队伍成员<strong>未掌握</strong>的技能编号以开启共同学习。<strong>用户 1</strong> 默认为当前使用者，请直接复制框内数据分享给其他队员。<br/>
              在其他用户的框中粘贴他人分享的编号数据（按逗号或空格分隔均可），系统会自动计算各个技能的未掌握人数，并允许依据未掌握人数在列表中过滤与排序。<br/>
              当用户2-8文本框非空时，自动进入多人模式，恢复到单人模式仅需要清空其他用户文本框中的内容即可<br/>
            （注：此功能尚在测试阶段，如果遇到问题可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
                rel="noopener noreferrer">点此反馈</a>）
            </p>

            <div class="m-config-container">
              <div class="m-input-row">
                <label>队伍人数：</label>
                <input class="name-input m-input" type="number" v-model="m" min="1" max="8" placeholder="填入组队人数 m..." />
              </div>
              <div v-if="m !== '' && bestParty" class="best-party-result">
                <strong>最优队伍构成：</strong>
                <span v-for="(idx, i) in bestParty.bestUsersIndices" :key="idx" class="user-badge">
                  {{ idx === 0 ? '用户 1 (我)' : (localPartyNames[idx - 1] || `用户 ${idx + 1}`) }}
                </span>
                <br />
                <span class="spell-count">最多可共同学习的技能数：<span class="highlight">{{ bestParty.maxCommonCount }}</span> 个</span>
              </div>
            </div>

            <div class="party-grid">
              <div class="party-user">
                <label>用户 1 (我)</label>
                <textarea v-model.lazy="localUser1Spells" title="在此编辑或复制你未掌握的技能数据" placeholder="填入未掌握技能编号..."></textarea>
              </div>
              <div class="party-user" v-for="i in 7" :key="i">
                <input class="name-input" v-model="localPartyNames[i-1]" :placeholder="'用户 ' + (i + 1)" />
                <textarea v-model.lazy="localPartyData[i-1]" placeholder="请粘贴其他用户分享的未掌握技能编号..."></textarea>
              </div>
            </div>
            
            <div class="reset-wrap">
              <button class="reset-btn" @click="resetParty">一键重置队友数据</button>
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
  margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #ffbe31; padding-bottom: 10px; color: #ffbe31;
}
.help-text p { line-height: 1.6; margin: 15px 0; }
.close-btn {
  position: absolute; top: 10px; right: 15px; background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; transition: color 0.2s;
}
.close-btn:hover { color: #ffbe31; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.party-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}
.party-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;
}
.party-user { display: flex; flex-direction: column; }
.party-user label {
  margin-bottom: 5px; color: #ffbe31; font-size: 0.9rem; font-weight: bold; line-height: 28px;
}

.name-input {
  margin-bottom: 5px; background: transparent; border: 1px dashed transparent; color: #ffbe31; font-size: 0.9rem; font-weight: bold; padding: 0 4px; border-radius: 4px; height: 28px; width: 100%; box-sizing: border-box; transition: border-color 0.2s; outline: none;
}
.name-input:hover, .name-input:focus { border-color: #ffbe31; background: #2b2b2b; }

.party-user textarea {
  background: #1a1a1a; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 8px; resize: vertical; min-height: 60px; font-family: monospace; font-size: 0.85rem;
}
.party-user textarea:focus { outline: none; border-color: #ffbe31; }

.reset-wrap { margin-top: 20px; display: flex; justify-content: flex-end; }
.reset-btn {
  background-color: transparent; color: #ffbe31; border: 1px solid #ffbe31; border-radius: 4px; padding: 6px 16px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
}
.reset-btn:hover { background-color: #ffbe31; color: #1a1a1a; }

/* 算法及新 UI 的专属样式 */
.m-config-container {
  background: rgba(255, 190, 49, 0.1); border-left: 4px solid #ffbe31; padding: 15px; margin-bottom: 20px; border-radius: 4px;
}
.m-input-row { display: flex; align-items: center; }
.m-input-row label { font-weight: bold; color: #ffbe31; margin-right: 10px; font-size: 0.9rem;}
.m-input { width: 150px; margin-bottom: 0; background: #2b2b2b; border: 1px solid #444;}
.best-party-result { margin-top: 12px; font-size: 0.95rem; line-height: 2; border-top: 1px dashed rgba(255, 190, 49, 0.3); padding-top: 10px;}
.user-badge {
  display: inline-block; background: #ffbe31; color: #1a1a1a; padding: 2px 10px; border-radius: 12px; margin-right: 6px; font-size: 0.8rem; font-weight: bold;
}
.spell-count { display: inline-block; margin-top: 5px; color: #ddd; }
.highlight { color: #ffbe31; font-weight: bold; font-size: 1.1rem; margin: 0 4px; }
</style>
