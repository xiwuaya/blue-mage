<script setup lang="ts">
// 1. 修改引入，增加 FilterKey
import type { FilterTypes, FilterKey } from "@/lib/interface";
import type { SpellType } from "@/lib/spell";
import Title from "./Title.vue";
import Indicator from "./Indicator.vue";

const props = defineProps<{
  filterTypes: FilterTypes;
  minUnlearned: number;
  orderByUnlearned: boolean;
}>();

// 2. 将 typeChange 事件的值类型改为 FilterKey（已将 levelChange 改为 unlearnedChange，并新增 openConfig）
const emit = defineEmits<{
  (e: "unlearnedChange", val: number): void;
  (e: "typeChange", val: FilterKey, checked: boolean): void;
  (e: "orderChange", val: boolean): void;
  (e: "openConfig"): void;
}>();

const handleInput = (e: Event) => {
  let val = +(e?.target as any).value;
  if (isNaN(val)) val = 1;
  emit("unlearnedChange", val);
};

// 3. 这里的 type 接收字符串，并断言为 FilterKey
const handleClick = (type: string | number, checked: boolean) => {
  emit("typeChange", type as FilterKey, !checked);
};

const handleOrder = (order: boolean) => {
  emit("orderChange", !order);
};
</script>

<template>
  <div class="wrap">
    <Title>
      开车模式
      <button class="config-btn" @click="emit('openConfig')" title="配置组队成员">配置</button>
    </Title>
    <div class="level">
      <span class="label">至少有</span>
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

    <Title>学习途径过滤</Title>
    <ul>
      <li
        v-for="(checked, type, i) in filterTypes"
        :key="type"
        class="type"
        :class="{
          lighter: i % 2 === 0,
        }"
        @click="handleClick(type, checked)"
      >
        <img :src="`icons/type_${type}.png`" />
        <Indicator :checked="checked" />
      </li>
    </ul>
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

/* 修改：开启横向滚动并防止换行 */
.wrap ul {
  display: flex;
  flex-wrap: nowrap; /* 从 wrap 改为 nowrap */
  margin: 0;
  padding: 0 0 6px 0; /* 底部稍微留一点空间给滚动条 */
  flex-shrink: 0;
  list-style: none;
  overflow-x: auto; /* 开启横向滚动 */
}

/* 新增：美化滚动条，使其适配网页的暗色主题 */
.wrap ul::-webkit-scrollbar {
  height: 6px;
}
.wrap ul::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}
.wrap ul::-webkit-scrollbar-track {
  background-color: #333;
}


/* 修改：固定单个分类的宽度 */
.type {
  position: relative;
  padding: 10px 0 6px;
  /* flex: 1; -> 删除原有的 flex: 1 */
  flex: 0 0 calc(100% / 6); /* 确保无论几个图标，每个依然只占原先的 1/6 宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.type img {
  width: 32px;
  height: 32px;
}

.type.lighter {
  background: #373737;
}

.type .indicator {
  margin-top: 10px;
}
</style>
