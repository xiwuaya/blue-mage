<script setup lang="ts">
import type { SpellStatusArray } from "@/lib/interface";
import { spells } from "@/lib/spell";
// --- 修改：引入 ref 用于控制折叠状态 ---
import { computed, ref } from "vue"; 
import PatchVersion from "./PatchVersion.vue";
import Title from "./Title.vue";

const props = defineProps<{
  spellStatus: SpellStatusArray;
}>();
const emit = defineEmits<{
  (e: "change", i: number, status: boolean): void;
}>();

// --- 新增：控制进度面板是否展开的状态，默认设为 true (展开) ---
const isProgressExpanded = ref(true);

class Counter {
  total = 0;
  learned = 0;

  get progress() {
    return this.total ? 0 : this.learned / this.total;
  }

  increase(learned: boolean) {
    this.total++;
    if (learned) {
      this.learned++;
    }
  }
}

const progress = computed(() =>
  spells.reduce<Record<string, Counter>>(
    (result, spell, index) => {
      if (!(spell.patch in result)) {
        result[spell.patch] = new Counter();
      }

      const isLearned = props.spellStatus[index] === 1;
      result.all.increase(isLearned);
      result[spell.patch].increase(isLearned);

      return result;
    },
    {
      all: new Counter(),
    }
  )
);

const setSpell = (i: number, status: boolean) => {
  if (!!props.spellStatus[i] === status) return;
  emit("change", i, status);
};

const batchSetSpell = (status: boolean, patch: string) => {
  for (let i = 0; i < spells.length; i++) {
    if (patch !== "all" && spells[i].patch !== patch) continue;
    setSpell(i, status);
  }
};

const width = (learned: number, total: number) => {
  return `${total ? (learned / total) * 100 : 0}%`;
};
</script>

<template>
  <div class="wrap">
    <Title @click="isProgressExpanded = !isProgressExpanded" class="collapsible-title">
      <span class="collapse-icon">{{ isProgressExpanded ? '▼' : '▶' }}</span> 进度
    </Title>
    
    <div 
      v-for="(counter, patch) in progress" 
      :key="patch" 
      class="item"
      v-show="patch === 'all' || isProgressExpanded"
    >
      <span>
        <patch-version v-if="patch !== 'all'" :version="patch" />
        <template v-else>总体</template>
      </span>
      <div class="detail">
        <button class="button" @click="batchSetSpell(false, patch)">
          清空
        </button>
        <div class="progress" :title="`${counter.learned}/${counter.total}`">
          <div :style="{ width: width(counter.learned, counter.total) }"></div>
        </div>
        <button class="button" @click="batchSetSpell(true, patch)">全选</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  user-select: none;
  display: flex;
  flex-wrap: wrap;
  width: 320px;
  margin-bottom: 20px;
  flex-shrink: 0;
  background: #2b2b2b;
}

/* --- 新增：折叠标题和箭头的专属样式 --- */
.collapsible-title {
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%; /* 确保标题占满整行 */
}
.collapsible-title:hover {
  opacity: 0.8;
}
.collapse-icon {
  display: inline-block;
  width: 16px;
  font-size: 0.8rem;
  color: #ffbe31;
}

.item {
  width: 100%;
  display: flex;
  margin-bottom: 5px;
}

.item > span {
  width: 50px;
}

.detail {
  display: flex;
  align-items: center;
  flex: 1;
}

.button {
  border: 0;
  background: none;
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.progress {
  height: 12px;
  flex: 1;
  background-color: #373737;
  border-radius: 6px;
}

.progress > div {
  height: 100%;
  background-color: #ffbe31;
  border-radius: 6px;
  transition: width 0.2s ease-in;
}
</style>
