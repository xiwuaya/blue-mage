<script setup lang="ts">
import { computed, ref } from "vue";
import {
  spells,
  learnedByNo,
  indexByNo,
  type Spell,
  renderSpellMethod,
} from "../lib/spell";
import type { FilterTypes, SpellStatusArray } from "@/lib/interface";
import SpellItem from "./SpellItem.vue";

const props = defineProps<{
  filterTypes: FilterTypes;
  filterLevel: number;
  filter: string;
  orderByLevel: boolean;
  spellStatus: SpellStatusArray;
}>();
const emit = defineEmits<{
  (e: "change", i: number, status: boolean): void;
  (e: "clearFilter"): void;
  (e: "search", keyword: string): void;
}>();

const notLearnedOnly = ref(true);

// 新增：用于控制是否隐藏红/灰颜色的开关
const hideSpecialColor = ref(true);

type Mode = "search" | "notLearned" | "all";
const mode = computed<Mode>(() => {
  if (props.filter) {
    return "search";
  } else if (notLearnedOnly.value) {
    return "notLearned";
  } else {
    return "all";
  }
});

const filters: Record<Mode, (spell: Spell, index: number) => boolean> = {
  search: (spell) => {
    const keyword = props.filter;

    
  // 1. 匹配技能编号和技能名称
  if (String(spell.no).includes(keyword) || spell.spell.includes(keyword)) {
    return true;
  }

  // 2. 匹配获取途径（专门提取文本字段，避开 position 和 level）
  return spell.method.some((m) => {
    const mAny = m as any;

    // --- 新增：如果是灰色的废弃途径，直接不参与搜索匹配 ---
    const c = (mAny.color || '').toLowerCase();
      if (['grey', '#666'].includes(c)) {
        return false;
      }
    // -----------------------------------------------------

    // 仅提取地图、副本、怪物、怪物等级评价(如A级,S级)这几个字段
    const searchableTexts = [
      mAny.map, 
      mAny.name, 
      mAny.mob, 
      mAny.rank
    ].filter(Boolean); // filter(Boolean) 会自动过滤掉不存在或为空的字段
    
    return searchableTexts.some(text => String(text).includes(keyword));
  });
  },
  notLearned: (spell, index) => {
    return (
      !props.spellStatus[index] &&
      spell.level <= props.filterLevel &&
      spell.method.some((m) => props.filterTypes[m.type])
    );
  },
  all: (spell) => {
    return (
      spell.level <= props.filterLevel &&
      spell.method.some((m) => props.filterTypes[m.type])
    );
  },
};

const showSpells = computed(() => {
  // 原本的 const 改为 let 以便后续过滤
  let filtered = spells.filter(filters[mode.value]);
  
  // 新增：如果开启了隐藏特定颜色，深度过滤 method 数组
  if (hideSpecialColor.value) {
    filtered = filtered.map(spell => {
      return {
        ...spell,
        method: spell.method.filter((m: any) => {
          const c = (m.color || '').toLowerCase();
          return !['red', '#ff0000', 'grey', '#666'].includes(c);
        })
      };
    }).filter(spell => spell.method.length > 0); // 隐藏后如果技能没有获取方式了，则不显示该技能
  }

  // --- 新增：在搜索模式下，自动过滤掉所有灰色途径 ---
  // if (mode.value === 'search') {
  //   filtered = filtered.map(spell => {
  //     return {
  //       ...spell,
  //       method: spell.method.filter((m: any) => {
  //         const c = (m.color || '').toLowerCase();
  //         return !['grey', '#666'].includes(c);
  //       })
  //     };
  //   }).filter(spell => spell.method.length > 0);
  // }
  // ------------------------------------------------
  if (props.orderByLevel) {
    filtered.sort((a, b) => a.level - b.level);
  }

  return filtered;
});

const allLearned = computed(() =>
  spells.every((_, i) => !!props.spellStatus[i])
);
</script>

<template>
  <main class="relative">
    <div class="notice">
      <template v-if="mode === 'notLearned'">
        {{
          showSpells.length
            ? "当前状态"
            : allLearned
            ? "恭喜，您已经掌会了当前版本的所有技能"
            : "当前条件下暂无可学习的技能"
        }}：
        <a href="javascript:void(0)" @click="notLearnedOnly = false">
          ○隐藏了已掌握技能
        </a>，
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          {{ hideSpecialColor ? '○隐藏了糟糕的学习途径' : '●显示了糟糕的学习途径' }}
        </a>
      </template>
      <template v-else-if="mode === 'all'">
        当前状态：
        <a href="javascript:void(0)" @click="notLearnedOnly = true">
          ●显示了已掌握技能
        </a>，
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          {{ hideSpecialColor ? '○隐藏了糟糕的学习途径' : '●显示了糟糕的学习途径' }}
        </a>
      </template>
      <template v-else>
        展示包含“{{ props.filter }}”的技能（{{ showSpells.length }} 个），
        <a href="javascript:void(0)" @click="emit('clearFilter')">
          清空搜索条件
        </a>，
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          {{ hideSpecialColor ? '○隐藏了糟糕的学习途径' : '●显示了糟糕的学习途径'  }}
        </a>
      </template>
    </div>
    <spell-item
      v-for="spell in showSpells"
      :key="spell.no"
      :spell="spell"
      :learned="learnedByNo(props.spellStatus, spell.no)"
      @change="emit('change', indexByNo(spell.no), $event)"
      @search="emit('search', $event)"
    />
  </main>
</template>

<style scoped>
.notice {
  border-bottom: 2px solid #ffbe31;
  padding-bottom: 10px;
  margin-bottom: 10px;
  line-height: 32px;
}

.notice a {
  color: #ffbe31;
  text-decoration: none;
}

.notice a:hover {
  border-bottom: 1px solid #ffbe31;
}

/* --- 新增：布局样式 --- */
.relative {
  position: relative;
}

.text-gold { color: #ffff00; }
.text-white { color: #ffffff; }
.text-red { color: #ca3a3a; }
.text-grey { color: #666; }

</style>
