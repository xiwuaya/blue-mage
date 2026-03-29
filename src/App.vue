<script setup lang="ts">
import Book from "./components/Book.vue";
import SpellList from "./components/SpellList.vue";
import Filter from "./components/Filter.vue";
import spells from "../tools/spells.json";
import { loadSetting, saveSetting } from "./lib/setting";
import { onBeforeMount, ref } from "vue";
import type { SpellType } from "./lib/spell";
import type {
  FilterTypes,
  SpellStatus,
  SpellStatusArray,
} from "./lib/interface";
import Progress from "./components/Progress.vue";

const filter = ref("");
const spellStatus = ref<SpellStatusArray>([]);
const filterTypes = ref<FilterTypes>({
  special: true,
  map: true,
  fate: true,
  dungeon: true,
  trail: true,
  raid: true,
});
const filterLevel = ref(80);
const orderByLevel = ref(false);

// --- 新增：帮助弹窗开关 ---
const showHelpModal = ref(false);

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
  filterLevel.value = loadSetting("filter-level") || 80;
  orderByLevel.value = loadSetting("order-by-level") || false;
});

const handleStatusChange = (index: number, learned: SpellStatus | boolean) => {
  const statusArr: SpellStatusArray = spells.map((_, i) =>
    (i === index ? learned : spellStatus.value[i]) ? 1 : 0
  );
  saveSetting("spell-status", statusArr);
  spellStatus.value = statusArr;
};

const handleTypeChange = (type: SpellType, checked: boolean) => {
  filterTypes.value = {
    ...filterTypes.value,
    [type]: checked,
  };
  saveSetting("filter-types", filterTypes.value);
};

const handleLevelChange = (val: number) => {
  filterLevel.value = val;
  saveSetting("filter-level", val);
};

const handleOrderChange = (val: boolean) => {
  orderByLevel.value = val;
  saveSetting("order-by-level", val);
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
      <Filter :filterTypes="filterTypes" :filterLevel="filterLevel" :orderByLevel="orderByLevel"
        @typeChange="handleTypeChange" @levelChange="handleLevelChange" @orderChange="handleOrderChange" />
      <Book :spellStatus="spellStatus" @change="handleStatusChange" />
      <Progress :spellStatus="spellStatus" @change="handleStatusChange" />
    </aside>
    <SpellList :filter="filter" :filterTypes="filterTypes" :filterLevel="filterLevel" :spellStatus="spellStatus"
      :orderByLevel="orderByLevel" @change="handleStatusChange" @clearFilter="filter = ''" @search="filter = $event" />
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
              本网页内容最近一次更新于<strong>2026年3月28日</strong>（7.45版本）。
            </p>
            <p>
              有对网页的建议反馈、或帮忙提供新的学习途径样本，可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
                rel="noopener noreferrer">点此提出建议</a>
            </p>
            <p>
              数据来源于<a href="https://thewakingsands.github.io/blue-mage/" target="_blank"
                rel="noopener noreferrer">青魔法师技能学习指南</a>，同时参考了<a href="http://www.timelysnow.com.cn/bluemagicebook/"
                target="_blank" rel="noopener noreferrer">青魔法电子书</a>
            </p>
            <!-- <p>
              在此衷心感谢<a href="https://thewakingsands.github.io/blue-mage/" target="_blank"
                rel="noopener noreferrer">青魔法师技能学习指南</a>和<a href="http://www.timelysnow.com.cn/bluemagicebook/"
                target="_blank" rel="noopener noreferrer">青魔法电子书</a>提供的框架及数据，以及 <strong>伊春@银泪湖  千羽绘@银泪湖 </strong>对数据的大量补充和整理。
            </p>
            <p>同时感谢所有参与测试及热爱青魔的广大玩家们，正是因为有你们的坚持与热爱，青魔才能在代代传承中不断探索，薪火相传，让后来者得以站在前人的肩膀上继续前行。</p> -->
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
  /* 使用主题黄 from App.vue */
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
  /* 确保在最上层 */
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
</style>
