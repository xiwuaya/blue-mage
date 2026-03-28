<script setup lang="ts">
import type { SpellStatusArray } from "@/lib/interface";
import { spells, learnedByNo, indexByNo } from "@/lib/spell";
import { computed, ref } from "vue";
import { spellIcon, spellIconSrcset } from "../icon";
import Title from "./Title.vue";

const props = defineProps<{
  spellStatus: SpellStatusArray;
}>();
const emit = defineEmits<{
  (e: "change", i: number, status: boolean): void;
}>();

const pageSize = 16;
const pages = Math.ceil(spells.length / pageSize);

const page = ref(1);
const showSpells = computed(() =>
  spells.slice((page.value - 1) * pageSize, page.value * pageSize)
);

const toggleSpell = (i: number) => {
  emit("change", i, !props.spellStatus[i]);
};
</script>

<template>
  <div class="wrap">
    <Title style="margin-bottom: 10px">青魔法书</Title>
    <div class="pager">
      <span
        v-for="p in pages"
        :key="p"
        @click="page = p"
        :class="{ active: page === p }"
        >{{ p }}</span
      >
    </div>
    <div
      v-for="(s, i) in showSpells"
      :key="s.no"
      class="spell"
      :class="{
        lighter: i % 2 === Math.floor(i / 4) % 2,
        learned: learnedByNo(props.spellStatus, s.no),
      }"
      @click="toggleSpell(indexByNo(s.no))"
      :title="s.spell"
      :data-ck-action-id="s.action"
    >
      <img :src="spellIcon(s)" :srcset="spellIconSrcset(s)" />
      <span>{{ s.no }}</span>
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

.pager {
  width: 100%;
  margin-bottom: 5px;
  color: #fff;
}

.pager span {
  display: inline-block;
  cursor: pointer;
  width: 20px;
  line-height: 16px;
  border: 1px solid transparent;
  border-radius: 2px;
  font-size: 14px;
  text-align: center;
}

.pager span.active {
  text-shadow: 0 0 2px #ffbe31;
  border-color: #ffbe31;
}

.spell {
  position: relative;
  height: 64px;
  width: 80px;
  padding-top: 10px;
  padding-left: 24px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
}

.spell.lighter {
  background: #373737;
}

.spell img {
  display: block;
  margin: 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 3px;
  box-shadow: 0 2px 2px #070707;
  opacity: 0.4;
}

.spell.learned img {
  opacity: 1;
}

.spell span {
  color: #eee1c5;
  font-size: 0.75rem;
  line-height: 16px;
}

.spell::before {
  position: absolute;
  top: 26px;
  left: 12px;
  display: block;
  width: 8px;
  height: 8px;
  content: "";
  background: #222;
  border: 2px solid #222;
}

.spell.learned::before {
  background: #ffbe31;
}

.note {
  margin-bottom: 0;
  font-size: 0.875rem;
}
</style>
