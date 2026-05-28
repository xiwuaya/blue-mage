<script setup lang="ts">
import Book from "./components/Book.vue";
import SpellList from "./components/SpellList.vue";
import Filter from "./components/Filter.vue";
import TypeFilter from "./components/TypeFilter.vue";
import spells from "../tools/spells.json";
import { loadSetting, saveSetting } from "./lib/setting";
import { onBeforeMount, ref, computed, watch } from "vue";
import type { SpellType } from "./lib/spell";
import type {
  FilterTypes,
  FilterKey,
  SpellStatus,
  SpellStatusArray,
} from "./lib/interface";
import Progress from "./components/Progress.vue";

const filter = ref("");
const spellStatus = ref<SpellStatusArray>([]);
const filterTypes = ref<FilterTypes>({
  carnivale: true,
  map: true,
  dungeon: true,
  trail: true,
  raid: true,
  other: true, // 新增 other，删掉 fate, treasure, guildhests 
});

// --- 新增：恢复角色等级和等级排序的数据状态 ---
const level = ref(80);
const orderByLevel = ref(false);

// --- 新增：多人模式的过滤与排序状态 ---
const minUnlearned = ref(1);
const orderByUnlearned = ref(true);

const showHelpModal = ref(false);

// --- 新增：队伍数据管理 ---
const partyData = ref<string[]>(Array(7).fill("")); // 保存用户2至用户8的字符串数据
// --- 新增：保存用户2至用户8的自定义名称 ---
const partyNames = ref<string[]>(Array(7).fill("")); 
const showPartyModal = ref(false);

// --- 修改：将用户1的数据改为可读写的计算属性，实现未掌握技能数据的导入和导出 ---
const user1Spells = computed({
  get() {
    return spells
      .filter((_, i) => spellStatus.value[i] !== 1) // !== 1 表示未掌握
      .map((s: any) => Number(s.no))
      .sort((a: number, b: number) => a - b)
      .join(" ");
  },
  set(val: string) {
    // 解析输入的未掌握技能编号
    const nums = val.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n));
    const unlearnedSet = new Set(nums);
    
    // 如果在输入框的未掌握集合中，状态设为 0 (未掌握)，否则设为 1 (已掌握)
    const statusArr: SpellStatusArray = spells.map((s: any) =>
      unlearnedSet.has(Number(s.no)) ? 0 : 1
    );
    saveSetting("spell-status", statusArr);
    spellStatus.value = statusArr;
  }
});

// --- 新增：一键重置队友数据和名称的函数 (仅重置用户2-8) ---
const resetParty = () => {
  partyData.value = Array(7).fill("");
  partyNames.value = Array(7).fill("");
};

// --- 修改：解析有效的队伍用户，返回一个包含所“未掌握”技能Set的数组 ---
const validUsers = computed(() => {
  const users = [];
  // 用户1：存放未掌握的技能
  const u1 = new Set(spells.filter((_, i) => spellStatus.value[i] !== 1).map((s: any) => Number(s.no)));
  users.push(u1);
  for (let i = 0; i < 7; i++) {
    const str = partyData.value[i] || "";
    if (str.trim()) {
      // 队友：存放输入的未掌握技能
      const nums = str.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n));
      users.push(new Set(nums));
    }
  }
  return users;
});

// --- 修改：计算出每个技能有多少个有效用户尚未掌握 ---
const unlearnedCountMap = computed(() => {
  const map = new Map<number, number>();
  spells.forEach((spell: any) => {
    let count = 0;
    validUsers.value.forEach(userSet => {
      // 因为现在 userSet 里面存的是“未掌握”的技能编号，
      // 所以如果 Set 里包含了这个技能，就代表他没掌握，count++
      if (userSet.has(Number(spell.no))) {
        count++;
      }
    });
    map.set(Number(spell.no), count);
  });
  return map;
});

// 是否处于多人模式（有除用户1之外的其他人存在）
const isPartyModeActive = computed(() => validUsers.value.length > 1);

// --- 新增：监听等级过滤和排序变更并自动保存 ---
watch(level, val => saveSetting("level", val));
watch(orderByLevel, val => saveSetting("order-by-level", val));

// --- 新增：监听多人模式相关配置变化并自动保存 ---
watch(minUnlearned, val => saveSetting("min-unlearned", val));
watch(orderByUnlearned, val => saveSetting("order-by-unlearned", val));
watch(partyData, val => saveSetting("party-data", val), { deep: true });
// --- 新增：监听队友名称配置并自动保存 ---
watch(partyNames, val => saveSetting("party-names", val), { deep: true });

onBeforeMount(() => {
  // --- 新增：首次加载自动弹出帮助 ---
  const hasSeenHelp = loadSetting<boolean>("has-seen-help");
  if (!hasSeenHelp) {
    showHelpModal.value = true;
    saveSetting("has-seen-help", true);
  }
  // ------------------------------

  let statusArr = loadSetting<SpellStatusArray>("spell-status") || [];
  if (!Array.isArray(statusArr)) {
    statusArr = [];
  }

  spellStatus.value = statusArr;
  filterTypes.value = {
    ...filterTypes.value,
    ...(loadSetting("filter-types") || {}),
  };
  // --- 新增：剔除旧版本遗留的分类 ---
  delete (filterTypes.value as any).special;
  delete (filterTypes.value as any).fate;
  delete (filterTypes.value as any).treasure;
  delete (filterTypes.value as any).guildhests
  // --------------------------------------------------------
  
  // --- 新增：读取保存的等级数据，如果没有则默认为80级 ---
  level.value = loadSetting("level") ?? 80;
  orderByLevel.value = loadSetting("order-by-level") ?? false;

  // --- 新增：读取新的队伍与过滤配置 ---
  minUnlearned.value = loadSetting("min-unlearned") ?? 1;
  orderByUnlearned.value = loadSetting("order-by-unlearned") ?? false;
  const savedParty = loadSetting<string[]>("party-data");
  if (Array.isArray(savedParty) && savedParty.length === 7) {
    partyData.value = savedParty;
  }

  // --- 新增：读取保存的队友自定义名称 ---
  const savedNames = loadSetting<string[]>("party-names");
  if (Array.isArray(savedNames) && savedNames.length === 7) {
    partyNames.value = savedNames;
  }
});

const handleStatusChange = (index: number, learned: SpellStatus | boolean) => {
  // 1. 更新当前用户（用户1）的状态
  const statusArr: SpellStatusArray = spells.map((_, i) =>
    (i === index ? learned : spellStatus.value[i]) ? 1 : 0
  );
  saveSetting("spell-status", statusArr);
  spellStatus.value = statusArr;

  // 2. 新增：如果在多人模式下操作，同步更新列表里其他组队成员的状态
  if (isPartyModeActive.value) {
    const targetSpellNo = Number(spells[index].no);
    const newPartyData = [...partyData.value];
    
    for (let i = 0; i < 7; i++) {
      const str = newPartyData[i] || "";
      if (str.trim()) {
        // 解析该队友目前的【未掌握】技能集合
        const nums = str.split(/[,，.、\s]+/).map(Number).filter(n => !isNaN(n));
        const numSet = new Set(nums);
        
        // --- 修改：逻辑翻转 ---
        // 如果 learned === true (学会了)，说明不再是“未掌握”，要从集合中移除
        // 如果 learned === false (忘了)，说明变成“未掌握”，要加入到集合中
        if (learned) {
          numSet.delete(targetSpellNo);
        } else {
          numSet.add(targetSpellNo);
        }
        
        // 重新转回字符串写回框内
        newPartyData[i] = Array.from(numSet).sort((a, b) => a - b).join(" ");
      }
    }
    partyData.value = newPartyData;
  }
};

// 2. 更新类型变更函数的入参类型
const handleTypeChange = (type: any, checked: boolean) => {
  filterTypes.value[type as keyof FilterTypes] = checked;
  saveSetting("filter-types", filterTypes.value);
};
</script>

<template>
  <section>
    <aside>
      <div class="sponsor-banner" @click="showHelpModal = true">
        <span>首次使用请点此查看帮助</span>
        <div class="help-icon" title="查看网页使用帮助">
          ?
        </div>
      </div>

      <input class="search" v-model="filter" placeholder="搜索技能编号、名称或获取方式" />
      
      <TypeFilter :filterTypes="filterTypes" @typeChange="handleTypeChange" />
      
      <Book :spellStatus="spellStatus" @change="handleStatusChange" />
      <Progress :spellStatus="spellStatus" @change="handleStatusChange" />
      
      <Filter 
        :filterTypes="filterTypes" 
        :level="level" 
        :orderByLevel="orderByLevel"
        :minUnlearned="minUnlearned" 
        :orderByUnlearned="orderByUnlearned"
        @typeChange="handleTypeChange" 
        @levelChange="val => level = val" 
        @orderLevelChange="val => orderByLevel = val"
        @unlearnedChange="val => minUnlearned = val" 
        @orderChange="val => orderByUnlearned = val" 
        @openConfig="showPartyModal = true" 
      />
    </aside>
    
    <SpellList 
      :filter="filter" 
      :filterTypes="filterTypes" 
      :level="level"
      :orderByLevel="orderByLevel"
      :minUnlearned="minUnlearned" 
      :spellStatus="spellStatus"
      :orderByUnlearned="orderByUnlearned" 
      :unlearnedCountMap="unlearnedCountMap" 
      :isPartyModeActive="isPartyModeActive"
      @change="handleStatusChange" 
      @clearFilter="filter = ''" 
      @search="filter = $event" 
    />
  </section>
  
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showHelpModal" class="modal-backdrop" @click.self="showHelpModal = false">
        <div class="modal-content">
          <button class="close-btn" @click="showHelpModal = false">&times;</button>
          <h3>帮助指南</h3>
          <div class="help-text">
            <p>
              进本前建议在本网页<strong>单击副本名</strong>（将自动填入搜索框），以检查副本中是否有其他专属技能可以学。另外，据称若解限打本时，高难本的习得概率大于普通版本。
            </p>
            <p><strong>获取途径颜色标识：</strong></p>
            <ul>
              <li><span class="color-def text-gold">金色代表最推荐的学习途径</span></li>
              <li><span class="color-def text-white">白色代表其他可选途径</span></li>
              <li><span class="color-def text-red">红色代表不建议考虑的途径</span></li>
              <li><span class="color-def text-grey">灰色代表确定无法学会的途径，以免后人重复实验</span></li>
            </ul>
            <p>
              本网页内容最近一次更新于<strong>2026年5月29日</strong>（7.50版本）。有对网页的建议反馈、或帮忙提供新的学习途径样本，可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
                rel="noopener noreferrer">点此提出</a>
            </p>
            <p>
              数据来源于<a href="https://thewakingsands.github.io/blue-mage/" target="_blank"
                rel="noopener noreferrer">青魔法师技能学习指南</a>和<a href="https://ff14.huijiwiki.com/" target="_blank"
                rel="noopener noreferrer">最终幻想XIV中文维基</a>，同时参考了<a href="http://www.timelysnow.com.cn/bluemagicebook/"
                target="_blank" rel="noopener noreferrer">青魔法电子书</a>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showPartyModal" class="modal-backdrop" @click.self="showPartyModal = false">
        <div class="modal-content party-modal">
          <button class="close-btn" @click="showPartyModal = false">&times;</button>
          <h3>多人模式配置</h3>
          <div class="help-text">
            <p style="margin-bottom: 20px;">
              在此配置队伍成员<strong>未掌握</strong>的技能编号以开启共同学习。<strong>用户 1</strong> 默认为当前使用者，请直接复制框内数据分享给其他队员。<br/>
              在其他用户的框中粘贴他人分享的编号数据（按逗号或空格分隔均可），系统会自动计算各个技能的未掌握人数，并允许依据未掌握人数在列表中过滤与排序。
            </p>
            
            <div class="party-grid">
              <div class="party-user">
                <label>用户 1 (我)</label>
                <textarea v-model.lazy="user1Spells" title="在此编辑或复制你未掌握的技能数据" placeholder="填入未掌握技能编号..."></textarea>
              </div>
              <div class="party-user" v-for="i in 7" :key="i">
                <input class="name-input" v-model="partyNames[i-1]" :placeholder="'用户 ' + (i + 1)" />
                <textarea v-model.lazy="partyData[i-1]" placeholder="请粘贴其他用户分享的未掌握技能编号..."></textarea>
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

<style>
html {
  font-size: 16px;
}

body {
  background: #2b2b2b;
  color: #fff;
  margin: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  padding: 20px;
}

#app aside {
  width: 320px;
}

@media (min-width: 1000px) {
  #app {
    padding-left: 360px;
  }

  #app aside {
    position: fixed;
    top: 20px;
    left: 20px;
  }
}

input {
  padding: 0 10px;
  border: 0;
  outline: 0;
  line-height: 32px;
  background: #333;
  color: #fff;
  border-radius: 16px;
  box-sizing: border-box;
}

input:focus {
  box-shadow: 0 0 2px #ffbe31;
}

input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>

<style scoped>
.search {
  width: 100%;
  margin-bottom: 20px;
}

/* --- 修改：使用 Flex 布局让问号靠右 --- */
.sponsor-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: rgba(255, 190, 49, 0.1);
  border-left: 4px solid #ffbe31;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.sponsor-info span {
  color: #ccc;
}

.sponsor-info a {
  color: #ffbe31;
  text-decoration: none;
  font-weight: bold;
}

.sponsor-info a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* --- 修改：移除绝对定位，适应 Flex --- */
/* --- 新增：问号图标样式 --- */
.help-icon {
  width: 22px;
  height: 22px;
  background-color: #ffbe31;
  color: #1a1a1a;
  border-radius: 50%;
  text-align: center;
  line-height: 22px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.help-icon:hover {
  opacity: 0.9;
  transform: scale(1.1);
}

/* --- 弹窗背景（全局覆盖） --- */
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

/* --- 弹窗内容样式 --- */
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

.help-text ul {
  list-style: none;
  padding-left: 5px;
  margin: 15px 0;
}

.help-text li {
  margin-bottom: 12px;
}

.help-text a {
  color: #ffbe31;
  text-decoration: underline;
}

/* --- 特定颜色文字定义 --- */
.color-def {
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 3px;
}

.text-gold {
  color: #ffff00;
}

.text-white {
  color: #ffffff;
}

.text-red {
  color: #ca3a3a;
}

.text-grey {
  color: #666;
}

/* --- 关闭按钮 --- */
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

/* --- 新增：弹窗淡入淡出动画 --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- 新增：组队配置弹窗独有样式 --- */
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
.party-user label {
  margin-bottom: 5px;
  color: #ffbe31;
  font-size: 0.9rem;
  font-weight: bold;
  /* --- 新增行高对齐以和右侧的可编辑名字输入框平齐 --- */
  line-height: 28px; 
}

/* --- 新增：可编辑玩家名字的样式 --- */
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
}

.name-input:hover, .name-input:focus {
  border-color: #ffbe31;
  outline: none;
  background: #2b2b2b; /* 悬浮或聚焦时展现可输入框的底色 */
}

.party-user textarea {
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

/* --- 新增：一键重置按钮外层容器 --- */
.reset-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* --- 新增：一键重置按钮样式 --- */
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
</style>
