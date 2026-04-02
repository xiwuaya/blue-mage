<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  spells,
  learnedByNo,
  indexByNo,
  type Spell,
  renderSpellMethod,
} from "../lib/spell";
import type { FilterTypes, SpellStatusArray } from "@/lib/interface";
import SpellItem from "./SpellItem.vue";
// 新增：引入本地存储方法
import { loadSetting, saveSetting } from "../lib/setting";

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

// --- 修改：从本地存储读取初始状态，如果从未设置过则默认为 true ---
const notLearnedOnly = ref(loadSetting<boolean>("notLearnedOnly") ?? true);
// 新增：用于控制是否隐藏红/灰颜色的开关
const hideSpecialColor = ref(loadSetting<boolean>("hide-special-color") ?? true);

// --- 新增：监听 notLearnedOnly和hideSpecialColor 的变化，一旦改变就自动保存到本地 ---
watch(notLearnedOnly, (newVal) => {
  saveSetting("notLearnedOnly", newVal);
});
watch(hideSpecialColor, (newVal) => {
  saveSetting("hide-special-color", newVal);
});
// -------------------------------------------------------------

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

const hiddenColors = ['red', '#ff0000', 'grey', '#666'];

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
      spell.method.some((m) => {
        // 条件1：该途径必须在当前勾选的 filterTypes 中
        if (!props.filterTypes[m.type]) return false;

        // 条件2：如果开启了隐藏特定颜色，则该途径的颜色不能是被隐藏的颜色
        if (hideSpecialColor.value) {
          const c = ((m as any).color || '').toLowerCase();
          if (hiddenColors.includes(c)) return false;
        }

        // 只有同时满足上述条件，这个途径才能成为该技能显示在列表中的“理由”
        return true;
      })
    );
  },
  all: (spell) => {
    return (
      spell.level <= props.filterLevel &&
      spell.method.some((m) => {
        if (!props.filterTypes[m.type]) return false;

        if (hideSpecialColor.value) {
          const c = ((m as any).color || '').toLowerCase();
          if (hiddenColors.includes(c)) return false;
        }

        return true;
      })
    );
  },
};

const showSpells = computed(() => {
  // 原本的 const 改为 let 以便后续过滤
  let filtered = spells.filter(filters[mode.value]);

  // 从视觉上剔除掉不需要渲染在页面上的获取途径
  // --- 修改：统一视觉过滤逻辑，将控制权完全交给开关 ---
  // 无论是在“分类模式”还是“搜索模式”，只要开关开启，就剔除红/灰
  // 如果开关关闭，就原样展示所有（包括搜索出来的技能里的灰色途径）
  if (hideSpecialColor.value) {
    filtered = filtered.map(spell => {
      return {
        ...spell,
        method: spell.method.filter((m: any) => {
          const c = (m.color || '').toLowerCase();
          //只要属于被隐藏的颜色，就从界面上移除
          return !hiddenColors.includes(c);
        })
      };
    }).filter(spell => spell.method.length > 0); // 隐藏后如果技能没有获取方式了，则不显示该技能
  }



  // ------------------------------------------------
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
          {{ hideSpecialColor ? '○隐藏了糟糕的学习途径' : '●显示了糟糕的学习途径' }}
        </a>
      </template>
    </div>
    <spell-item v-for="spell in showSpells" :key="spell.no" :spell="spell"
      :learned="learnedByNo(props.spellStatus, spell.no)" @change="emit('change', indexByNo(spell.no), $event)"
      @search="emit('search', $event)" />
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
</style>
