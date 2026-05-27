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
// --- 新增：引入本地存储方法，用于保存用户的过滤偏好 ---
import { loadSetting, saveSetting } from "../lib/setting";

const props = defineProps<{
  filterTypes: FilterTypes;
  minUnlearned: number;
  filter: string;
  orderByUnlearned: boolean;
  spellStatus: SpellStatusArray;
  // --- 新增：接收从 App.vue 传来的每个技能未掌握人数 Map ---
  unlearnedCountMap: Map<number, number>;
  // --- 新增：接收是否处于开车模式（队伍人数 > 1）的状态 ---
  isPartyModeActive: boolean;
}>();
const emit = defineEmits<{
  (e: "change", i: number, status: boolean): void;
  (e: "clearFilter"): void;
  (e: "search", keyword: string): void;
}>();

// --- 修改：从本地存储读取初始状态，如果从未设置过则默认为 true ---
const notLearnedOnly = ref(loadSetting<boolean>("notLearnedOnly") ?? true);
// --- 新增：用于控制是否隐藏红/灰等不推荐途径颜色的开关 ---
const hideSpecialColor = ref(loadSetting<boolean>("hide-special-color") ?? true);

// --- 新增：监听 notLearnedOnly 和 hideSpecialColor 的变化，一旦改变就自动保存到本地 ---
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

// --- 新增：需要被隐藏的颜色常量列表 ---
const hiddenColors = ['red', '#ff0000', 'grey', '#666'];

// 辅助函数：将底层获取途径映射到 UI 过滤器的 key 上
const getFilterKey = (type: string): keyof FilterTypes => {
  if (type === 'fate' || type === 'hunt' || type === 'treasure' || type === 'guildhests' ) {
    return 'other';
  }
  if (type === 'special') {
    return 'carnivale';
  }
  return type as keyof FilterTypes;
};


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
    // --- 修改：加入 Number() 强制类型转换以修复 TS 类型不匹配（因为 spell.no 类型定义为 string，而 Map 的 key 是 number） ---
    const count = props.unlearnedCountMap.get(Number(spell.no)) || 0;
    // --- 修改：当处于开车模式，未掌握的标准是这支队伍中有人没掌握(未掌握人数 > 0)；否则就是当前使用者(你)没掌握 ---
    const isNeeded = props.isPartyModeActive ? count > 0 : !props.spellStatus[index];

    return (
      isNeeded &&
      // --- 修改：判断未掌握人数是否达到填写的最小门槛 ---
      count >= props.minUnlearned &&
      spell.method.some((m) => {
        // 条件1：该途径必须在当前勾选的 filterTypes 中
        if (!props.filterTypes[getFilterKey(m.type)]) return false;

        // --- 新增：条件2：如果开启了隐藏特定颜色，则该途径的颜色不能是被隐藏的颜色 ---
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
    // --- 修复：在 all（显示全部）模式下，不应该再被 minUnlearned (至少多少人未掌握) 门槛拦截。
    // 如果拦截了，那么所有人已掌握的技能(count === 0)将永远无法被显示。 ---
    return (
      spell.method.some((m) => {
        if (!props.filterTypes[getFilterKey(m.type)]) return false;

        // --- 新增：剔除隐藏颜色的获取途径 ---
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
          // 只要属于被隐藏的颜色，就从界面上移除
          return !hiddenColors.includes(c);
        })
      };
    }).filter(spell => spell.method.length > 0); // 隐藏后如果技能没有获取方式了，则不显示该技能
  }

  // --- 新增：如果勾选了按未掌握人数排序，则将未掌握人数最多的技能排在最前面 ---
  if (props.orderByUnlearned) {
    filtered.sort((a, b) => {
      // 修复：加入 Number() 避免TS类型检查阻断及运行报错
      const countDiff = (props.unlearnedCountMap.get(Number(b.no)) || 0) - (props.unlearnedCountMap.get(Number(a.no)) || 0);
      // 若未掌握人数相等，则按编号从小到大排序作为备选规则
      return countDiff !== 0 ? countDiff : (Number(a.no) - Number(b.no));
    });
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
            : allLearned && !props.isPartyModeActive
              ? "恭喜，您已经掌会了当前版本的所有技能"
              : "当前条件下暂无可学习的技能"
        }}：
        <a href="javascript:void(0)" @click="notLearnedOnly = false">
          ○隐藏了已掌握技能
        </a>；
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          {{ hideSpecialColor ? '○隐藏了糟糕的学习途径' : '●显示了糟糕的学习途径' }}
        </a>
      </template>
      <template v-else-if="mode === 'all'">
        当前状态：
        <a href="javascript:void(0)" @click="notLearnedOnly = true">
          ●显示了已掌握技能
        </a>；
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
      :learned="props.isPartyModeActive ? (props.unlearnedCountMap.get(Number(spell.no)) || 0) === 0 : learnedByNo(props.spellStatus, spell.no)" 
      :unlearnedCount="props.unlearnedCountMap.get(Number(spell.no))"
      :showUnlearnedCount="props.isPartyModeActive"
      @change="emit('change', indexByNo(spell.no), $event)"
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
