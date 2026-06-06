<script setup lang="ts">
import Book from "./components/Book.vue";
import SpellList from "./components/SpellList.vue";
import Filter from "./components/Filter.vue";
import TypeFilter from "./components/TypeFilter.vue";
import PartyModal from "./components/PartyModal.vue";
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
  other: true,
});

const level = ref(80);
const orderByLevel = ref(false);
const minUnlearned = ref(1);
const orderByUnlearned = ref(true);
const showHelpModal = ref(false);
const showPatchVersion = ref(loadSetting<boolean>("show-patch-version") ?? false);
watch(showPatchVersion, val => saveSetting("show-patch-version", val));

// --- 核心新增与重构：队伍数据与显隐三态管理 ---
const partyData = ref<string[]>(Array(7).fill("")); 
const partyNames = ref<string[]>(Array(7).fill(""));
const user1Name = ref<string>(""); 
const showPartyModal = ref(false);

// 将状态从子组件提升至父组件管理 (0: 默认可见, 1: 必带高亮, 2: 隐藏不计)
const user1VisibilityState = ref<number>(0);
const partyVisibilityStates = ref<number[]>(Array(7).fill(0));

// 将用户1的技能数据改为 ref 存储，以便更精准地控制同步阻断
const user1Spells = ref<string>("");

// 监听主界面技能状态变更：当用户1处于非隐藏状态时，同步更新其文本框
watch(spellStatus, (newStatus) => {
  if (user1VisibilityState.value !== 2) {
    user1Spells.value = spells
      .filter((_, i) => newStatus[i] !== 1)
      .map((s: any) => Number(s.no))
      .sort((a: number, b: number) => a - b)
      .join(" ");
  }
}, { deep: true });

// 监听用户1在弹窗中手动修改文本框：反向同步回主界面的 spellStatus 勾选状态
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

// 当用户1从隐藏(2)切换回可见状态(0或1)时，立刻从当前的 spellStatus 刷新同步一次数据
watch(user1VisibilityState, (val) => {
  if (val !== 2) {
    user1Spells.value = spells
      .filter((_, i) => spellStatus.value[i] !== 1)
      .map((s: any) => Number(s.no))
      .sort((a: number, b: number) => a - b)
      .join(" ");
  }
});

// 解析有效的队伍用户（计算未掌握人数时，直接跳过被隐藏的用户）
const validUsers = computed(() => {
  const users = [];
  
  // 用户1：非隐藏状态才加入未掌握计数池
  if (user1VisibilityState.value !== 2) {
    const nums = (user1Spells.value.match(/\d+/g) || []).map(Number);
    users.push(new Set(nums));
  }
  
  // 队友：非隐藏状态才加入未掌握计数池
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
      if (userSet.has(Number(spell.no))) {
        count++;
      }
    });
    map.set(Number(spell.no), count);
  });
  return map;
});

// 是否处于多人模式（至少有一个未隐藏且非空的队友存在时，主界面才启用多人视图）
const isPartyModeActive = computed(() => {
  return partyData.value.some((str, i) => str.trim() && partyVisibilityStates.value[i] !== 2);
});

// 监听持久化配置自动保存
watch(level, val => saveSetting("level", val));
watch(orderByLevel, val => saveSetting("order-by-level", val));
watch(minUnlearned, val => saveSetting("min-unlearned", val));
watch(orderByUnlearned, val => saveSetting("order-by-unlearned", val));
watch(partyData, val => saveSetting("party-data", val), { deep: true });
watch(partyNames, val => saveSetting("party-names", val), { deep: true });
watch(user1Name, val => saveSetting("user1-name", val));
watch(user1VisibilityState, val => saveSetting("user1-visibility-state", val));
watch(partyVisibilityStates, val => saveSetting("party-visibility-states", val), { deep: true });

onBeforeMount(() => {
  const hasSeenHelp = loadSetting<boolean>("has-seen-help");
  if (!hasSeenHelp) {
    showHelpModal.value = true;
    saveSetting("has-seen-help", true);
  }

  let statusArr = loadSetting<SpellStatusArray>("spell-status") || [];
  if (!Array.isArray(statusArr)) statusArr = [];
  spellStatus.value = statusArr;
  
  // 初始化用户1的文本框数据
  user1Spells.value = spells
    .filter((_, i) => spellStatus.value[i] !== 1)
    .map((s: any) => Number(s.no))
    .sort((a: number, b: number) => a - b)
    .join(" ");

  filterTypes.value = { ...filterTypes.value, ...(loadSetting("filter-types") || {}) };
  delete (filterTypes.value as any).special;
  delete (filterTypes.value as any).fate;
  delete (filterTypes.value as any).treasure;
  delete (filterTypes.value as any).guildhests;
  
  level.value = loadSetting("level") ?? 80;
  orderByLevel.value = loadSetting("order-by-level") ?? false;
  minUnlearned.value = loadSetting("min-unlearned") ?? 1;
  orderByUnlearned.value = loadSetting("order-by-unlearned") ?? false;
  
  const savedParty = loadSetting<string[]>("party-data");
  if (Array.isArray(savedParty)) partyData.value = savedParty;

  const savedNames = loadSetting<string[]>("party-names");
  if (Array.isArray(savedNames)) partyNames.value = savedNames;
  
  const savedUser1Name = loadSetting<string>("user1-name");
  if (savedUser1Name) user1Name.value = savedUser1Name;

  // 读取持久化的三态状态配置
  user1VisibilityState.value = loadSetting<number>("user1-visibility-state") ?? 0;
  const savedVisibilities = loadSetting<number[]>("party-visibility-states");
  if (Array.isArray(savedVisibilities)) {
    partyVisibilityStates.value = savedVisibilities;
  } else {
    partyVisibilityStates.value = Array(partyData.value.length).fill(0);
  }
});

// --- 补回被遗漏的类型变更处理器 ---
const handleTypeChange = (type: string, checked: boolean) => {
  filterTypes.value[type as keyof FilterTypes] = checked;
  saveSetting("filter-types", filterTypes.value);
};

// 单一状态改变同步处理器
const handleStatusChange = (index: number, learned: SpellStatus | boolean) => {
  const statusArr: SpellStatusArray = spells.map((_, i) =>
    (i === index ? learned : spellStatus.value[i]) ? 1 : 0
  );
  saveSetting("spell-status", statusArr);
  spellStatus.value = statusArr;

  // 多人同步逻辑：仅修改未隐藏(state !== 2)的队友文本框
  const targetSpellNo = Number(spells[index].no);
  const newPartyData = [...partyData.value];
  let isChanged = false;
  
  for (let i = 0; i < newPartyData.length; i++) {
    // 如果该用户被隐藏，直接跳过，不修改其文本框数据
    if (partyVisibilityStates.value[i] === 2) continue;
    
    const str = newPartyData[i] || "";
    if (str.trim()) {
      const nums = (str.match(/\d+/g) || []).map(Number);
      const numSet = new Set(nums);
      
      if (learned) {
        numSet.delete(targetSpellNo);
      } else {
        numSet.add(targetSpellNo);
      }
      
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

  // 批量同步：仅修改未隐藏(state !== 2)的队友文本框
  const newPartyData = [...partyData.value];
  let isChanged = false;
  
  for (let i = 0; i < newPartyData.length; i++) {
    // 如果该用户被隐藏，直接跳过，不修改其文本框数据
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
</script>

<template>
  <section>
    <aside>
      <div class="sponsor-banner" @click="showHelpModal = true">
        <span>首次使用请点此查看帮助</span>
        <div class="help-icon" title="查看网页使用帮助">?</div>
      </div>
      <input class="search" v-model="filter" placeholder="搜索技能编号、名称或获取方式" />
      <TypeFilter :filterTypes="filterTypes" @typeChange="handleTypeChange" />
      <Book :spellStatus="spellStatus" @change="handleStatusChange" />
      <Progress 
        :spellStatus="spellStatus" 
        v-model:isExpanded="showPatchVersion" 
        @change="handleStatusChange" 
        @batchChange="handleBatchStatusChange"
      />
      <Filter
        v-show="showPatchVersion"
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
      :showPatchVersion="showPatchVersion"
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
              本网页内容最近一次更新于<strong>2026年6月6日</strong>（7.51版本）。有对网页的建议反馈、或帮忙提供新的学习途径样本，可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
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

  <PartyModal 
    v-model:user1Spells="user1Spells" 
    v-model:user1Name="user1Name"
    v-model:partyData="partyData" 
    v-model:partyNames="partyNames" 
    v-model:user1VisibilityState="user1VisibilityState"
    v-model:partyVisibilityStates="partyVisibilityStates"
    :filterTypes="filterTypes"
    :show="showPartyModal" 
    @close="showPartyModal = false" 
    @resetMinUnlearned="minUnlearned = 1"
  />
</template>

<style>
html { font-size: 16px; }
body { background: #2b2b2b; color: #fff; margin: 0; }
#app { font-family: "Avenir", Helvetica, Arial, sans-serif; padding: 20px; }
#app aside { width: 320px; }
@media (min-width: 1000px) {
  #app { padding-left: 360px; }
  #app aside { position: fixed; top: 20px; left: 20px; max-height: calc(100vh - 40px); overflow-y: auto; }
  #app aside::-webkit-scrollbar { width: 6px; }
  #app aside::-webkit-scrollbar-thumb { background-color: #555; border-radius: 3px; }
}
input { padding: 0 10px; border: 0; outline: 0; line-height: 32px; background: #333; color: #fff; border-radius: 16px; box-sizing: border-box; }
input:focus { box-shadow: 0 0 2px #ffbe31; }
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
.search { width: 100%; margin-bottom: 20px; }
.sponsor-banner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 8px 12px; background: rgba(255, 190, 49, 0.1); border-left: 4px solid #ffbe31; border-radius: 4px; font-size: 0.9rem; }
.help-icon { width: 22px; height: 22px; background-color: #ffbe31; color: #1a1a1a; border-radius: 50%; text-align: center; line-height: 22px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.help-icon:hover { transform: scale(1.1); }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-content { background-color: #2c2c2c; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; position: relative; color: #e0e0e0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); border: 1px solid #444; }
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
.close-btn { position: absolute; top: 10px; right: 15px; background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; }
.close-btn:hover { color: #ffbe31; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
