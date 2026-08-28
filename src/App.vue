<script setup lang="ts">
import Book from "./components/Book.vue";
import SpellList from "./components/SpellList.vue";
import Filter from "./components/Filter.vue";
import TypeFilter from "./components/TypeFilter.vue";
import PartyModal from "./components/PartyModal.vue";
import { loadSetting, saveSetting } from "./lib/setting";
import { onBeforeMount, ref, computed, watch } from "vue";
import type { FilterTypes } from "./lib/interface";
import Progress from "./components/Progress.vue";
import { useSpellSync } from "./lib/useSpellSync";

const {
  spellStatus,
  partyData,
  partyNames,
  partyColors,
  partyVisibilityStates,
  user1Name,
  user1VisibilityState,
  user1Spells,
  unlearnedCountMap,
  unlearnedNamesMap,
  unlearnedUsersMap,
  isPartyModeActive,
  handleStatusChange,
  handleBatchStatusChange
} = useSpellSync();

const filter = ref("");
const filterTypes = ref<FilterTypes>({
  carnivale: true,
  map: true,
  dungeon: true,
  trail: true,
  raid: true,
  other: true,
});

const level = ref(loadSetting<number>("level") ?? 80);
const orderByLevel = ref(loadSetting<boolean>("order-by-level") ?? false);
const minUnlearned = ref(loadSetting<number>("min-unlearned") ?? 1);
const orderByUnlearned = ref(loadSetting<boolean>("order-by-unlearned") ?? false);

const showMoreConfig = ref(loadSetting<boolean>("show-more-config") ?? false);
const showPatchVersion = ref(loadSetting<boolean>("show-patch-version") ?? false);
const showUnlearnedUsers = ref(loadSetting<boolean>("show-unlearned-users") ?? false)

const showHelpModal = ref(false);
const showPartyModal = ref(false);
// 监听持久化配置自动保存

watch(level, val => saveSetting("level", val));
watch(orderByLevel, val => saveSetting("order-by-level", val));
watch(minUnlearned, val => saveSetting("min-unlearned", val));
watch(orderByUnlearned, val => saveSetting("order-by-unlearned", val));

watch(showMoreConfig, val => saveSetting("show-more-config", val));
watch(showPatchVersion, val => saveSetting("show-patch-version", val));
watch(showUnlearnedUsers, val => saveSetting("show-unlearned-users", val));

onBeforeMount(() => {
  const hasSeenHelp = loadSetting<boolean>("has-seen-help");
  if (!hasSeenHelp) {
    showHelpModal.value = true;
    saveSetting("has-seen-help", true);
  }


  filterTypes.value = { ...filterTypes.value, ...(loadSetting("filter-types") || {}) };
  delete (filterTypes.value as any).special;
  delete (filterTypes.value as any).fate;
  delete (filterTypes.value as any).treasure;
  delete (filterTypes.value as any).guildhests;

});

// --- 补回被遗漏的类型变更处理器 ---
const handleTypeChange = (type: string, checked: boolean) => {
  filterTypes.value[type as keyof FilterTypes] = checked;
  saveSetting("filter-types", filterTypes.value);
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
        v-model:isExpanded="showMoreConfig"
        v-model:showPatchVersion="showPatchVersion"
        @change="handleStatusChange" 
        @batchChange="handleBatchStatusChange"
      />
      <Filter
        v-show="showMoreConfig"
        :filterTypes="filterTypes" 
        :level="level" 
        :orderByLevel="orderByLevel"
        :minUnlearned="minUnlearned" 
        :orderByUnlearned="orderByUnlearned"
        v-model:showUnlearnedUsers="showUnlearnedUsers"
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
      :unlearnedNamesMap="unlearnedNamesMap"
      :unlearnedUsersMap="unlearnedUsersMap"
      :isPartyModeActive="isPartyModeActive"
      :showPatchVersion="showPatchVersion"
      :showUnlearnedUsers="showUnlearnedUsers"
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
              本网页内容最近一次更新于<strong>2026年8月29日</strong>（7.55版本）。有对网页的建议反馈、或帮忙提供新的学习途径样本，可以<a href="https://docs.qq.com/sheet/DSE1BTnd5YkNJeGNk" target="_blank"
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
    v-model:partyColors="partyColors"
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
  #app aside::-webkit-scrollbar { width: 6px; height: 6px; }
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
