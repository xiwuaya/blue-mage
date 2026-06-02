<script setup lang="ts">
import { ref, watch, computed } from 'vue';
// --- 新增：引入所有技能数据和过滤器类型 ---
import { spells } from '@/lib/spell';
import type { FilterTypes } from '@/lib/interface';

// ==========================================
// 1. 属性接收与事件定义 (与父组件双向绑定)
// ==========================================
const props = defineProps<{
  show: boolean;           // 控制弹窗显示与隐藏
  user1Spells: string;     // 用户1(当前使用者)的未掌握技能数据字符串
  user1Name: string;       // 用户1的自定义名称
  partyData: string[];     // 队友(用户2-8)的未掌握技能数据 (数组长度恒定为7)
  partyNames: string[];    // 队友(用户2-8)的自定义名称 (数组长度恒定为7)
    filterTypes: FilterTypes; // --- 新增：接收从 App.vue 传来的过滤配置 ---
}>();

const emit = defineEmits<{
  (e: 'close'): void;                                 // 通知父组件关闭弹窗
  (e: 'update:user1Spells', val: string): void;       // 双向绑定更新用户1的技能数据
  (e: 'update:user1Name', val: string): void;         // 双向绑定更新用户1的名字
  (e: 'update:partyData', val: string[]): void;       // 双向绑定更新队友的技能数据
  (e: 'update:partyNames', val: string[]): void;      // 双向绑定更新队友的名字
  (e: 'resetMinUnlearned'): void; // <-- 新增这一行：用于通知父组件重置人数
}>();

// ==========================================
// 2. 本地状态管理
// ==========================================
// 期望组队人数 m (输入框绑定的值)，默认为空字符串以展示 placeholder
const m = ref<number | "">("");

// 控制“最优组队推荐”面板的折叠状态，默认为 false (关闭状态，节约空间)
const isAlgoExpanded = ref(false);

// 创建本地 ref，克隆传入的 props。
// 目的：在组件内部可以直接用 v-model 绑定这些局部变量，避免违反 Vue 的单向数据流规则(直接修改 props 报错)
const localUser1Spells = ref(props.user1Spells);
const localUser1Name = ref(props.user1Name);
const localPartyData = ref([...props.partyData]);
const localPartyNames = ref([...props.partyNames]);

// 监听本地数据的变化，一旦用户在输入框打字修改，立刻通过 emit 通知父组件更新（触发父组件的保存逻辑）
// 替换原本的这 4 行 watch：
watch(localUser1Spells, (val) => {
  if (val !== props.user1Spells) emit('update:user1Spells', val);
});
watch(localUser1Name, (val) => {
  if (val !== props.user1Name) emit('update:user1Name', val);
});
watch(localPartyData, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyData)) {
    emit('update:partyData', val);
  }
}, { deep: true });
watch(localPartyNames, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(props.partyNames)) {
    emit('update:partyNames', val);
  }
}, { deep: true });

// 监听父组件的数据变化，同步到本地
// 目的：如果在弹窗外(如侧边栏)勾选了技能，弹窗内的数据也能实时响应更新
watch(() => props.user1Spells, (val) => localUser1Spells.value = val);
watch(() => props.user1Name, (val) => localUser1Name.value = val);
// --- 修复恶性死循环 ---
watch(() => props.partyData, (val) => {
  // 如果转成字符串后发现内容一模一样，就说明是自己 emit 触发的，拒绝重新赋值
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

// 一键复制用户 1 的未掌握技能数据到系统剪贴板
const copyUser1Data = async () => {
  try {
    // 优先尝试使用现代浏览器的 Clipboard API
    await navigator.clipboard.writeText(localUser1Spells.value);
    alert("已成功复制！");
  } catch (err) {
    // 降级处理：兼容不支持 Clipboard API 的浏览器环境 (如非 HTTPS 站点或旧版浏览器)
    const textArea = document.createElement("textarea");
    textArea.value = localUser1Spells.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("已成功复制！");
  }
};

// 一键重置队友数据 (仅重置用户 2-8 的数据和名字，安全保留用户 1 的心血数据)
const resetParty = () => {
  localPartyData.value = Array(7).fill("");
  localPartyNames.value = Array(7).fill("");
  emit('resetMinUnlearned'); // <-- 新增这一行：触发重置人数事件
};

// --- 新增：辅助函数，将技能底层的获取途径分类映射为 filterTypes 的 key ---
const getFilterKey = (type: string): keyof FilterTypes => {
  if (type === 'fate' || type === 'hunt' || type === 'treasure' || type === 'guildhests') {
    return 'other';
  }
  if (type === 'special') {
    return 'carnivale';
  }
  return type as keyof FilterTypes;
};

// ==========================================
// 4. 最优组队算法 (状态压缩 + 暴力枚举)
// ==========================================
// 计算出能够共同学习最多技能的 m 人小队
const bestParty = computed(() => {
  // 1. 校验目标人数 m 的合法性
  const targetM = typeof m.value === 'string' ? parseInt(m.value) : m.value;
  if (isNaN(targetM) || targetM <= 0 || targetM > 8) return null;

  const n = 8; // 最大参与计算的总用户数 (用户1 到 用户8)
  const usersSets: Set<number>[] = [];

  // 解析并存入 用户 1 的未掌握技能集合
  const u1Nums = localUser1Spells.value.split(/[,，\.、\s]+/).map(Number).filter(x => !isNaN(x));
  usersSets.push(new Set(u1Nums));

  // 解析并存入 用户 2-8 的未掌握技能集合
  for (let i = 0; i < 7; i++) {
    const str = localPartyData.value[i] || "";
    if (str.trim()) {
      const nums = str.split(/[,，\.、\s]+/).map(Number).filter(x => !isNaN(x));
      usersSets.push(new Set(nums));
    } else {
      usersSets.push(new Set()); // 如果该队友框内为空，视作没有未掌握技能，存入空集合
    }
  }
  
  // --- 新增：预处理 ---
  // 提前筛选出当前符合“学习途径过滤”的所有合法技能编号，存入 Set 以便 O(1) 快速查询
  const validSpellNos = new Set<number>();
  for (const spell of spells) {
    const isValid = spell.method.some((m) => props.filterTypes[getFilterKey(m.type)]);
    if (isValid) {
      validSpellNos.add(Number(spell.no));
    }
  }

  // 2. 状态压缩：计算每个技能的 SpellMask
  // 如果某技能被第 i 个用户未掌握，则将该技能 Mask 的第 i 位设为 1
  const spellMasks = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    for (const spellNo of usersSets[i]) {
      // --- 修改：只把符合学习途径过滤的技能加入掩码计算池，过滤掉不在 validSpellNos 集合内的技能 ---
      if (!validSpellNos.has(spellNo)) continue;
      const currentMask = spellMasks.get(spellNo) || 0;
      spellMasks.set(spellNo, currentMask | (1 << i)); 
    }
  }

  // 3. 找到所有正好包含 m 个人 (即二进制有 m 个 1) 的队伍组合 PartyMask
  const partyMasks = [];
  for (let i = 1; i < (1 << n); i++) {
    let countOnes = 0;
    for (let j = 0; j < n; j++) {
      if ((i & (1 << j)) !== 0) countOnes++;
    }
    // 选出合法组合
    if (countOnes === targetM) {
      partyMasks.push(i);
    }
  }

  // 4. 评估所有合法的队伍组合，用位运算快速筛选交集最大的队伍
  let maxCommonCount = -1;
  let bestPartyMasks: number[] = []; // 用于存储可能存在的多个并列最优队伍

  for (const pMask of partyMasks) {
    let currentCommonCount = 0;
    
    // 遍历所有技能掩码
    for (const sMask of spellMasks.values()) {
      // 核心算法：当某技能的掩码(sMask)和队伍掩码(pMask)按位与之后等于队伍掩码自身时，
      // 代表这个队伍里每一位玩家对应的比特位都是 1，即所有人都没有掌握该技能，判定为可共同学习！
      if ((sMask & pMask) === pMask) {
        currentCommonCount++;
      }
    }
    
    // 更新最大值与结果集
    if (currentCommonCount > maxCommonCount) {
      maxCommonCount = currentCommonCount;
      bestPartyMasks = [pMask]; // 发现更大的值，直接覆盖旧数据
    } else if (currentCommonCount === maxCommonCount) {
      bestPartyMasks.push(pMask); // 与最大值相等，加入数组中作为并列的最优解
    }
  }

  // 如果没有任何共同技能或没有合法队伍，终止输出
  if (maxCommonCount === -1 || bestPartyMasks.length === 0) return null;

  // 5. 将所有最优二进制队伍掩码，分别还原为可视的用户索引 (二维数组)
  const allBestUsersIndices: number[][] = [];
  for (const mask of bestPartyMasks) {
    const indices = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        indices.push(i);
      }
    }
    allBestUsersIndices.push(indices);
  }

  return {
    allBestUsersIndices, // 包含多个队伍构成的二维数组：[[0,1,2], [0,1,3], ...]
    maxCommonCount       // 最多可共同学习的技能数量
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
              在其他用户的框中粘贴他人分享的编号数据（按逗号或空格分隔均可），系统会自动计算各个技能的未掌握人数，并允许依据未掌握人数在列表中过滤与排序。<br/>
              当用户2-8文本框非空时，自动进入多人模式，恢复到单人模式仅需要清空其他用户文本框中的内容即可<br/>
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
                  placeholder="填入组队人数…" 
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
                  <div class="no-skills-tips">当前分类下暂无可共同学习技能</div>
                </template>
                
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
              <button class="reset-btn" @click="resetParty" title="清空用户2至8的所有名称和数据">清除多人数据</button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* -------------------------------------
   弹窗整体结构与背景样式
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

.help-text a {
  color: #ffbe31;
  text-decoration: underline;
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
.close-btn:hover { color: #ffbe31; }

/* 弹窗淡入淡出过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* -------------------------------------
   组队配置网格样式 (Grid 布局)
------------------------------------- */
/* 为了容纳 8 个人，覆盖原弹窗的最大宽度 */
.party-modal { max-width: 800px; max-height: 90vh; overflow-y: auto; }
/* 使用 Grid 自动分配列数，最小宽度 200px */
.party-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
.party-user { display: flex; flex-direction: column; }

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
/* 悬浮或聚焦时展示边框提示其可编辑性 */
.name-input:hover, .name-input:focus { border-color: #ffbe31; background: #2b2b2b; }

/* 文本框与内部绝对定位按钮包裹层 */
.textarea-wrapper { position: relative; width: 100%; display: flex; flex-direction: column; }
.party-user textarea {
  width: 100%; box-sizing: border-box; background: #1a1a1a; color: #fff; border: 1px solid #444;
  border-radius: 4px; padding: 8px; resize: vertical; min-height: 60px; font-family: monospace; font-size: 0.85rem;
}
.party-user textarea:focus { outline: none; border-color: #ffbe31; }

/* 用户 1 文本框内的复制按钮 */
.copy-btn {
  position: absolute; top: 6px; right: 6px; background: #2b2b2b; color: #ffbe31; border: 1px solid #444;
  border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; font-weight: bold; cursor: pointer; opacity: 0.7; transition: all 0.2s;
}
.copy-btn:hover { opacity: 1; background: #ffbe31; color: #1a1a1a; border-color: #ffbe31; }

/* 底部重置按钮容器与按钮自身 */
.reset-wrap { margin-top: 20px; display: flex; justify-content: flex-end; }
.reset-btn {
  background-color: transparent; color: #ffbe31; border: 1px solid #ffbe31; border-radius: 4px;
  padding: 6px 16px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
}
.reset-btn:hover { background-color: #ffbe31; color: #1a1a1a; }

/* -------------------------------------
   算法运算结果展示区样式
------------------------------------- */
/* 折叠面板的点击标题 */
.filter-header {
  font-size: 1rem; font-weight: bold; color: #ffbe31; cursor: pointer; margin-bottom: 10px; transition: opacity 0.2s; display: flex; align-items: center;
}
.filter-header:hover { opacity: 0.8; }
.collapse-icon { display: inline-block; width: 16px; font-size: 0.8rem; color: #ffbe31; }

/* 折叠面板内容包裹区 (通过左侧内边距塑造层级感) */
.algo-content { margin-bottom: 20px; padding-left: 16px; }

/* 队伍人数配置行 */
.m-input-row { display: flex; align-items: center; }
.m-input-row label { font-weight: bold; color: #ffbe31; margin-right: 10px; font-size: 0.9rem; }
.m-input { width: 150px; margin-bottom: 0; background: #2b2b2b; border: 1px solid #444; }

/* 最优结果信息块 */
.best-party-result { 
  margin-top: 12px; font-size: 0.95rem; line-height: 2; border-top: 1px dashed rgba(255, 190, 49, 0.3); padding-top: 10px;
}

/* 多行并列展示时的排版样式 */
.team-row { margin-top: 6px; }
.or-text { color: #ccc; font-weight: bold; margin-right: 6px; font-size: 0.9rem; }
.spell-count-row { margin-top: 6px; }

/* 玩家名字的高亮小徽章 */
.user-badge {
  display: inline-block; background: #ffbe31; color: #1a1a1a; padding: 2px 10px; border-radius: 12px; margin-right: 6px; font-size: 0.8rem; font-weight: bold;
}
.spell-count { display: inline-block; margin-top: 5px; color: #ddd; }
/* 共同技能最大数量的显眼数字 */
.highlight { color: #ffbe31; font-weight: bold; font-size: 1.1rem; margin: 0 4px; }
</style>

/* 当没有技能可学时的提示文字样式 */
.no-skills-tips {
  color: #999;
  font-size: 0.95rem;
  margin-top: 5px;
}