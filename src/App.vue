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

onBeforeMount(() => {
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
      <input
        class="search"
        v-model="filter"
        placeholder="搜索技能名或获取方式"
      />
      <Filter
        :filterTypes="filterTypes"
        :filterLevel="filterLevel"
        :orderByLevel="orderByLevel"
        @typeChange="handleTypeChange"
        @levelChange="handleLevelChange"
        @orderChange="handleOrderChange"
      />
      <Book :spellStatus="spellStatus" @change="handleStatusChange" />
      <Progress :spellStatus="spellStatus" @change="handleStatusChange" />
    </aside>
    <SpellList
      :filter="filter"
      :filterTypes="filterTypes"
      :filterLevel="filterLevel"
      :spellStatus="spellStatus"
      :orderByLevel="orderByLevel"
      @change="handleStatusChange"
      @clearFilter="filter = ''"
      @search="filter = $event"
    />
  </section>
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

</style>
