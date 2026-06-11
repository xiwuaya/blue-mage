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
import { loadSetting, saveSetting } from "../lib/setting";

const props = defineProps<{
  filterTypes: FilterTypes;
  level: number;
  orderByLevel: boolean;
  minUnlearned: number;
  filter: string;
  orderByUnlearned: boolean;
  spellStatus: SpellStatusArray;
  unlearnedCountMap: Map<number, number>;
  unlearnedNamesMap: Map<number, string[]>;
  isPartyModeActive: boolean;
  showPatchVersion: boolean;
}>();
const emit = defineEmits<{
  (e: "change", i: number, status: boolean): void;
  (e: "clearFilter"): void;
  (e: "search", keyword: string): void;
}>();

const notLearnedOnly = ref(loadSetting<boolean>("notLearnedOnly") ?? true);
const hideSpecialColor = ref(loadSetting<boolean>("hide-special-color") ?? true);

watch(notLearnedOnly, (newVal) => {
  saveSetting("notLearnedOnly", newVal);
});
watch(hideSpecialColor, (newVal) => {
  saveSetting("hide-special-color", newVal);
});

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
    if (String(spell.no).includes(keyword) || spell.spell.includes(keyword)) {
      return true;
    }
    return spell.method.some((m) => {
      const mAny = m as any;
      const c = (mAny.color || '').toLowerCase();
      if (['grey', '#666'].includes(c)) return false;
      const searchableTexts = [mAny.map, mAny.name, mAny.mob, mAny.rank].filter(Boolean);
      return searchableTexts.some(text => String(text).includes(keyword));
    });
  },
  notLearned: (spell, index) => {
    const count = props.unlearnedCountMap.get(Number(spell.no)) || 0;
    
    // 强制保障单人模式下的状态匹配
    const isNeeded = props.isPartyModeActive ? count > 0 : !learnedByNo(props.spellStatus, spell.no);
    // 强制保障单人模式下直接绕过 minUnlearned 的阻截
    const meetsCountThreshold = props.isPartyModeActive ? count >= props.minUnlearned : true;

    return (
      isNeeded &&
      spell.level <= props.level &&
      meetsCountThreshold &&
      spell.method.some((m) => {
        if (!props.filterTypes[getFilterKey(m.type)]) return false;
        if (hideSpecialColor.value) {
          const c = ((m as any).color || '').toLowerCase();
          if (hiddenColors.includes(c)) return false;
        }
        return true;
      })
    );
  },
  all: (spell) => {
    return (
      spell.level <= props.level &&
      spell.method.some((m) => {
        if (!props.filterTypes[getFilterKey(m.type)]) return false;
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
  let filtered = spells.filter(filters[mode.value]);

  if (hideSpecialColor.value) {
    filtered = filtered.map(spell => {
      return {
        ...spell,
        method: spell.method.filter((m: any) => {
          const c = (m.color || '').toLowerCase();
          return !hiddenColors.includes(c);
        })
      };
    }).filter(spell => spell.method.length > 0); 
  }

  if (props.orderByUnlearned) {
    filtered.sort((a, b) => {
      const countDiff = (props.unlearnedCountMap.get(Number(b.no)) || 0) - (props.unlearnedCountMap.get(Number(a.no)) || 0);
      if (countDiff !== 0) {
        return countDiff;
      }
      if (props.orderByLevel && a.level !== b.level) {
        return a.level - b.level;
      }
      return Number(a.no) - Number(b.no);
    });
  } else if (props.orderByLevel) {
    filtered.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return Number(a.no) - Number(b.no);
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
          <i class="eye-icon icon-invisible inline-icon"></i>隐藏了已掌握技能
        </a>；
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          <i class="eye-icon inline-icon" :class="hideSpecialColor ? 'icon-invisible' : 'icon-visible'"></i>{{ hideSpecialColor ? '隐藏了糟糕的学习途径' : '显示了糟糕的学习途径' }}
        </a>
      </template>
      <template v-else-if="mode === 'all'">
        当前状态：
        <a href="javascript:void(0)" @click="notLearnedOnly = true">
          <i class="eye-icon icon-visible inline-icon"></i>显示了已掌握技能
        </a>；
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          <i class="eye-icon inline-icon" :class="hideSpecialColor ? 'icon-invisible' : 'icon-visible'"></i>{{ hideSpecialColor ? '隐藏了糟糕的学习途径' : '显示了糟糕的学习途径' }}
        </a>
        <span v-if="props.orderByUnlearned" class="sort-hint">
          (注：开启人数排序时，已掌握技能会沉降至列表最底部)
        </span>
      </template>
      <template v-else>
        展示包含“{{ props.filter }}”的技能（{{ showSpells.length }} 个），
        <a href="javascript:void(0)" @click="emit('clearFilter')">
          清空搜索框
        </a>，
        <a href="javascript:void(0)" @click="hideSpecialColor = !hideSpecialColor">
          <i class="eye-icon inline-icon" :class="hideSpecialColor ? 'icon-invisible' : 'icon-visible'"></i>{{ hideSpecialColor ? '隐藏了糟糕的学习途径' : '显示了糟糕的学习途径' }}
        </a>
      </template>
    </div>
    
    <spell-item v-for="spell in showSpells" :key="spell.no" :spell="spell"
      :learned="props.isPartyModeActive ? (props.unlearnedCountMap.get(Number(spell.no)) || 0) === 0 : learnedByNo(props.spellStatus, spell.no)" 
      :unlearnedCount="props.unlearnedCountMap.get(Number(spell.no))"
      :unlearnedNames="props.unlearnedNamesMap.get(Number(spell.no))"
      :showUnlearnedCount="props.isPartyModeActive"
      :showPatchVersion="props.showPatchVersion"
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

/* --- 新增：眼部图标相关样式 --- */
.eye-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-color: currentColor; 
}

.icon-visible {
  -webkit-mask: url('/icons/Visible.svg') no-repeat center / contain;
  mask: url('/icons/Visible.svg') no-repeat center / contain;
}

.icon-invisible {
  -webkit-mask: url('/icons/Invisible.svg') no-repeat center / contain;
  mask: url('/icons/Invisible.svg') no-repeat center / contain;
}

.inline-icon {
  vertical-align: middle; 
  margin-right: 4px; 
  position: relative;
  top: -2px; 
}

.sort-hint {
  color: #999;
  font-size: 0.85rem;
  margin-left: 8px;
}

.relative {
  position: relative;
}

.text-gold { color: #ffff00; }
.text-white { color: #ffffff; }
.text-red { color: #ca3a3a; }
.text-grey { color: #666; }
</style>
