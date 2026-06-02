<script setup lang="ts">
import type { Spell } from "@/lib/spell";
import { spellIcon, spellIconSrcset } from "../icon";
import SpellMethod from "./Method.vue";
import PatchVersion from "./PatchVersion.vue";
import Tag from "./Tag.vue";
import Indicator from "./Indicator.vue";

const props = defineProps<{
  spell: Spell;
  learned: boolean;
  unlearnedCount?: number;
  showUnlearnedCount?: boolean;
  showPatchVersion: boolean; // --- 新增这行 ---
}>();
const emit = defineEmits<{
  (e: "change", status: boolean): void;
  (e: "search", keyword: string): void;
}>();
</script>

<template>
  <div class="spell">
    <img
      class="icon"
      :src="spellIcon(props.spell, true)"
      :srcset="spellIconSrcset(props.spell, true)"
      :data-ck-action-id="props.spell.action"
    />
    <div class="content">
      <h4>
        <patch-version v-show="props.showPatchVersion" :version="spell.patch" />
        <Tag
          color="#eee1c5"
          title="点击切换学习状态"
          style="cursor: pointer"
          @click="emit('change', !learned)"
        >
          <Indicator :checked="props.learned" />
          No.{{ props.spell.no }}
        </Tag>
        {{ props.spell.spell }}
        <small>(Lv.{{ props.spell.level }})</small>
        <small v-if="props.showUnlearnedCount" class="unlearned-count text-gold">
          (未掌握人数: {{ props.unlearnedCount }})
        </small>
      </h4>
      <ul class="methods">
        <li v-for="(m, mi) in props.spell.method" :key="mi">
          <spell-method :method="m" @search="emit('search', $event)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.spell {
  display: flex;
  min-height: 48px;
  padding: 10px;
}

.icon {
  float: left;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 5px;
  box-shadow: 0 2px 2px #070707;
}

.content {
  overflow: hidden;
  color: #fff;
}

.content h4 {
  margin: 0;
  line-height: 24px;
  font-size: 1rem;
  font-weight: normal;
}

.content .indicator {
  margin-right: 3px;
}

.unlearned-count {
  margin-left: 8px;
  font-weight: bold;
}
.text-gold {
  color: #ffbe31;
}

.methods {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
