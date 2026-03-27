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

// --- 新增：用于控制帮助弹窗的开关 ---
const showHelpModal = ref(false);

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
    return (
      // 新增：判断搜索词是否包含在技能编号中
      String(spell.no).includes(props.filter) ||
      spell.spell.includes(props.filter) ||
      spell.method.some((m) => renderSpellMethod(m).includes(props.filter))
    );
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
    <div 
      class="help-icon" 
      @click="showHelpModal = true" 
      title="查看网页使用帮助"
    >
      ?
    </div>

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
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showHelpModal" 
          class="modal-backdrop" 
          @click.self="showHelpModal = false"
        >
          <div class="modal-content">
            <button class="close-btn" @click="showHelpModal = false">&times;</button>
            <h3>帮助指南</h3>
            <div class="help-text">
              <p>
                进本前建议在本网页<strong>单击副本名</strong>（将自动填入搜索框），以检查副本中是否有其他专属技能可以学。
              </p>
              <p><strong>获取途径颜色标识：</strong></p>
              <ul>
                <li><span class="color-def text-gold">金色代表最推荐的学习途径</span></li>
                <li><span class="color-def text-white">白色代表其他可选途径</span></li>
                <li><span class="color-def text-red">红色代表不建议考虑的途径</span></li>
                <li><span class="color-def text-grey">灰色代表确定无法学会的途径，以免后人重复实验</span></li>
              </ul>
              <p>
                本网页内容最近一次更新于<strong>2026年3月26日</strong>（7.45版本）。
              </p>
              <p>
                数据来源于<a href="https://thewakingsands.github.io/blue-mage/" target="_blank" rel="noopener noreferrer">青魔法师技能学习指南</a>，同时参考了<a href="http://www.timelysnow.com.cn/bluemagicebook/" target="_blank" rel="noopener noreferrer">青魔法电子书</a>。
              </p>
              <p>
                有对网页的建议反馈、或帮忙提供新的学习途径样本，可以在GitHub提出 <a href="https://github.com/xiwuaya/blue-mage/issues" target="_blank" rel="noopener noreferrer">Issue</a> 或加<a href="https://qm.qq.com/q/haCYH87Vug?from=tim" target="_blank" rel="noopener noreferrer">QQ3278542912</a>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* --- 新增：问号图标样式 --- */
.help-icon {
  position: absolute;
  top: 10px;
  right: 15px;
  width: 26px;
  height: 26px;
  background-color: #ffbe31; /* 使用主题黄 from App.vue */
  color: #1a1a1a;
  border-radius: 50%;
  text-align: center;
  line-height: 26px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: opacity 0.2s, transform 0.2s;
  z-index: 10;
}

.help-icon:hover {
  opacity: 0.9;
  transform: scale(1.1);
}

/* --- 新增：弹窗背景（全局覆盖） --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* 确保在最上层 */
}

/* --- 新增：弹窗内容样式 --- */
.modal-content {
  background-color: #2c2c2c;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
  color: #e0e0e0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  border: 1px solid #444;
}

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

/* --- 新增：特定颜色文字定义 --- */
.color-def {
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 3px;
}

.text-gold { color: #ffff00; }
.text-white { color: #ffffff; }
.text-red { color: #ca3a3a; }
.text-grey { color: #666; }

/* --- 新增：关闭按钮 --- */
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ffbe31;
}

/* --- 新增：弹窗淡入淡出动画 --- */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
