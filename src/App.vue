<script setup lang="ts">
import Book from "./components/Book.vue";
import SpellList from "./components/SpellList.vue";
import Filter from "./components/Filter.vue";
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

// --- 修改：将按等级过滤改为按未掌握人数过滤 ---
const minUnlearned = ref(1);
const orderByUnlearned = ref(false);

// --- 新增：帮助弹窗开关 ---
const showHelpModal = ref(false);

// --- 新增：队伍数据管理 ---
const partyData = ref<string[]>(Array(7).fill("")); // 保存用户2至用户8的字符串数据
const showPartyModal = ref(false);

// 根据当前使用者的状态，自动生成掌握的技能编号字符串（用作用户1的数据）
const user1Spells = computed(() => {
  return spells
    .filter((_, i) => spellStatus.value[i] === 1)
    .map((s: any) => Number(s.no))
    .sort((a: number, b: number) => a - b)
    .join(", ");
});

// 解析有效的队伍用户，返回一个包含所掌握技能Set的数组
const validUsers = computed(() => {
  const users = [];
  // 用户1：修复为数字 Set
  const u1 = new Set(spells.filter((_, i) => spellStatus.value[i] === 1).map((s: any) => Number(s.no)));
  users.push(u1);
  // 用户2-8
  for (let i = 0; i < 7; i++) {
    const str = partyData.value[i] || "";
    if (str.trim()) {
      // 兼容中英文逗号或空格分隔，解析为数字类型
      const nums = str.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n));
      users.push(new Set(nums));
    }
  }
  return users;
});

// 计算出每个技能有多少个有效用户尚未掌握
const unlearnedCountMap = computed(() => {
  const map = new Map<number, number>();
  spells.forEach((spell: any) => {
    let count = 0;
    validUsers.value.forEach(userSet => {
      // 修复：强制转换为 Number 再使用 has() 判断
      if (!userSet.has(Number(spell.no))) {
        count++;
      }
    });
    map.set(Number(spell.no), count);
  });
  return map;
});

// 是否处于开车模式（有除用户1之外的其他人存在）
const isPartyModeActive = computed(() => validUsers.value.length > 1);

// --- 新增：监听开车模式相关配置变化并自动保存 ---
watch(minUnlearned, val => saveSetting("min-unlearned", val));
watch(orderByUnlearned, val => saveSetting("order-by-unlearned", val));
watch(partyData, val => saveSetting("party-data", val), { deep: true });

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
  
  // --- 修改：读取新的队伍与过滤配置 ---
  minUnlearned.value = loadSetting("min-unlearned") ?? 1;
  orderByUnlearned.value = loadSetting("order-by-unlearned") ?? false;
  const savedParty = loadSetting<string[]>("party-data");
  if (Array.isArray(savedParty) && savedParty.length === 7) {
    partyData.value = savedParty;
  }
});

const handleStatusChange = (index: number, learned: SpellStatus | boolean) => {
  // 1. 更新当前用户（用户1）的状态
  const statusArr: SpellStatusArray = spells.map((_, i) =>
    (i === index ? learned : spellStatus.value[i]) ? 1 : 0
  );
  saveSetting("spell-status", statusArr);
  spellStatus.value = statusArr;

  // 2. 修改：如果在开车模式下操作，同步更新列表里其他组队成员的状态
  if (isPartyModeActive.value) {
    const targetSpellNo = Number(spells[index].no);
    const newPartyData = [...partyData.value];
    
    for (let i = 0; i < 7; i++) {
      const str = newPartyData[i] || "";
      if (str.trim()) {
        // 解析该队友目前的技能集合
        const nums = str.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n));
        const numSet = new Set(nums);
        
        // 增减勾选的技能
        if (learned) {
          numSet.add(targetSpellNo);
        } else {
          numSet.delete(targetSpellNo);
        }
        
        // 重新转回字符串写回框内
        newPartyData[i] = Array.from(numSet).sort((a, b) => a - b).join(", ");
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
      <Filter :filterTypes="filterTypes" :minUnlearned="minUnlearned" :orderByUnlearned="orderByUnlearned"
        @typeChange="handleTypeChange" @unlearnedChange="val => minUnlearned = val" @orderChange="val => orderByUnlearned = val" @openConfig="showPartyModal = true" />
      <Book :spellStatus="spellStatus" @change="handleStatusChange" />
      <Progress :spellStatus="spellStatus" @change="handleStatusChange" />
    </aside>
    <SpellList :filter="filter" :filterTypes="filterTypes" :minUnlearned="minUnlearned" :spellStatus="spellStatus"
      :orderByUnlearned="orderByUnlearned" :unlearnedCountMap="unlearnedCountMap" :isPartyModeActive="isPartyModeActive"
      @change="handleStatusChange" @clearFilter="filter = ''" @search="filter = $event" />
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
              本网页内容最近一次更新于<strong>2026年5月27日</strong>（7.50版本）。有对网页的建议反馈、或帮忙提供新的学习途径样本，可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
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
          <h3>开车模式配置</h3>
          <div class="help-text">
            <p style="margin-bottom: 20px;">
              在此配置队伍成员已掌握的技能编号以开启共同学习。<strong>用户 1</strong> 默认为当前使用者，请直接复制框内数据分享给其他队员。<br/>
              在其他用户的框中粘贴他人分享的编号数据（按逗号或空格分隔均可），系统会自动计算各个技能的未掌握人数，并允许依据未掌握人数在列表中过滤与排序。<br/>（注：此功能尚在测试阶段，如果遇到问题可前往帮助中的文档反馈）
            </p>
            <div class="party-grid">
              <div class="party-user">
                <label>用户 1 (我)</label>
                <textarea :value="user1Spells" readonly title="在此复制你已掌握的技能数据分享给他人"></textarea>
              </div>
              <div class="party-user" v-for="i in 7" :key="i">
                <label>用户 {{ i + 1 }}</label>
                <textarea v-model="partyData[i-1]" placeholder="请粘贴其他用户分享的已掌握技能编号..."></textarea>
              </div>
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
.party-user textarea:read-only {
  background: #333;
  color: #999;
  cursor: copy;
}
.party-user textarea:focus {
  outline: none;
  border-color: #ffbe31;
}
</style>
