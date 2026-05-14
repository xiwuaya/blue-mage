<script setup lang="ts">
import type { FilterTypes } from "@/lib/interface";
import type { SpellType } from "@/lib/spell";
import Title from "./Title.vue";
import Indicator from "./Indicator.vue";

const props = defineProps<{
  filterTypes: FilterTypes;
  filterLevel: number;
  orderByLevel: boolean;
}>();

const emit = defineEmits<{
  (e: "levelChange", val: number): void;
  (e: "typeChange", val: SpellType, checked: boolean): void;
  (e: "orderChange", val: boolean): void;
}>();

const handleInput = (e: Event) => {
  let val = +(e?.target as any).value;
  if (isNaN(val)) val = 80;
  emit("levelChange", val);
};

const handleClick = (type: SpellType, checked: boolean) => {
  emit("typeChange", type, !checked);
};

const handleOrder = (order: boolean) => {
  emit("orderChange", !order);
};
</script>

<template>
  <div class="wrap">
    <Title>角色等级</Title>
    <div class="level">
      <input
        type="number"
        max="80"
        min="1"
        :value="props.filterLevel"
        @input="handleInput"
      />
      <div
        class="order"
        :class="{ checked: props.orderByLevel }"
        @click="handleOrder(props.orderByLevel)"
      >
        <Indicator :checked="props.orderByLevel" bordered />
        按等级排序
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

.level {
  display: flex;
}

.order {
  display: flex;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;
}

.order .indicator {
  margin-right: 10px;
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
