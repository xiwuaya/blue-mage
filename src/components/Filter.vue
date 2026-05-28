<script setup lang="ts">
import { ref } from "vue";
import Indicator from "./Indicator.vue";

const props = defineProps<{
  // --- 新增：接收从 App 传来的角色等级和是否按等级排序的状态 ---
  level: number;
  orderByLevel: boolean;
  // --- 新增：接收从 App 传来的最少未掌握人数和是否按未掌握人数排序的状态 ---
  minUnlearned: number;
  orderByUnlearned: boolean;
}>();

const emit = defineEmits<{
  // --- 新增：当角色等级或等级排序发生改变时，通知父组件 ---
  (e: "levelChange", val: number): void;
  (e: "orderLevelChange", val: boolean): void;
  // --- 新增：当未掌握人数或人数排序发生改变时，通知父组件 ---
  (e: "unlearnedChange", val: number): void;
  (e: "orderChange", val: boolean): void;
  // --- 新增：点击配置按钮，通知父组件打开队伍配置弹窗 ---
  (e: "openConfig"): void;
}>();

// --- 新增：控制“等级与多人模式”整个面板是否折叠的状态，默认为 false (收起) ---
const isSettingsExpanded = ref(false);

// --- 新增：处理角色等级输入框的值变化 ---
const handleLevelInput = (e: Event) => {
  let val = +(e?.target as any).value;
  // 如果输入不合法，默认回退到 80 级
  if (isNaN(val)) val = 80;
  emit("levelChange", val);
};

// --- 新增：处理按等级排序按钮的点击 ---
const handleOrderLevel = (order: boolean) => {
  emit("orderLevelChange", !order);
};

// --- 新增：处理未掌握人数输入框的值变化 ---
const handleInput = (e: Event) => {
  let val = +(e?.target as any).value;
  // 如果输入不合法，默认回退到 1 人
  if (isNaN(val)) val = 1;
  emit("unlearnedChange", val);
};

// --- 新增：处理按未掌握人数排序按钮的点击 ---
const handleOrder = (order: boolean) => {
  emit("orderChange", !order);
};
</script>

<template>
  <div class="wrap">
    <div @click="isSettingsExpanded = !isSettingsExpanded" class="filter-header">
      <span class="collapse-icon">{{ isSettingsExpanded ? '▼' : '▶' }}</span> ----过滤器----
    </div>
    
    <div v-show="isSettingsExpanded" class="collapse-content">
      <div class="large-title">角色等级</div>
      <div class="level row-spacing">
        <input
          type="number"
          max="80"
          min="1"
          class="num-input"
          :value="props.level"
          @input="handleLevelInput"
        />
        <div
          class="order"
          :class="{ checked: props.orderByLevel }"
          @click="handleOrderLevel(props.orderByLevel)"
        >
          <Indicator :checked="props.orderByLevel" bordered />
          按等级排序
        </div>
      </div>

      <div class="large-title">
        多人模式
        <button class="config-btn" @click.stop="emit('openConfig')" title="配置组队成员">配置</button>
      </div>
      <div class="level">
        <span class="label">至少</span>
        <input
          type="number"
          max="8"
          min="0"
          class="num-input"
          :value="props.minUnlearned"
          @input="handleInput"
        />
        <span class="label">人未掌握</span>
        <div
          class="order"
          :class="{ checked: props.orderByUnlearned }"
          @click="handleOrder(props.orderByUnlearned)"
        >
          <Indicator :checked="props.orderByUnlearned" bordered />
          按未掌握人数排序
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  user-select: none;
  margin-bottom: 20px;
}

.wrap input {
  padding: 0 10px;
  line-height: 32px;
  background: #333;
  color: #fff;
  border: 1px solid #333;
  border-radius: 16px;
}

/* --- 新增：小字过滤器折叠头的样式 --- */
.filter-header {
  font-size: 0.8rem;
  color: #999;
  cursor: pointer;
  margin-bottom: 10px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}
.filter-header:hover {
  color: #ddd;
}
.collapse-icon {
  display: inline-block;
  width: 16px;
  font-size: 0.8rem;
  color: #ffbe31;
}

/* --- 新增：大字体标题的样式 --- */
.large-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.collapse-content {
  margin-bottom: 15px; 
}

/* --- 新增：角色等级与多人模式两行输入框之间的垂直间距 --- */
.row-spacing {
  margin-bottom: 15px; 
}

/* --- 新增：配置按钮的样式 --- */
.config-btn {
  margin-left: 8px;
  background-color: #ffbe31;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  vertical-align: middle;
}
.config-btn:hover {
  opacity: 0.8;
}

.level {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 正常大小字体 */
.label {
  font-size: 0.9rem;
  color: #ccc;
  white-space: nowrap;
}

.num-input {
  width: 50px;
  text-align: center;
  padding: 0 5px;
  line-height: 32px;
  background: #333;
  color: #fff;
  border: 1px solid #333;
  border-radius: 16px;
}

/* 正常大小字体 */
.order {
  display: flex;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
  font-size: 0.9rem;
}

.order .indicator {
  margin-right: 6px;
}
</style>
