<script setup lang="ts">
import type { FilterTypes, FilterKey } from "@/lib/interface";
import Title from "./Title.vue";
import Indicator from "./Indicator.vue";

const props = defineProps<{
  filterTypes: FilterTypes;
}>();

const emit = defineEmits<{
  (e: "typeChange", val: FilterKey, checked: boolean): void;
}>();

// 处理学习途径类型的点击切换
const handleClick = (type: string | number, checked: boolean) => {
  emit("typeChange", type as FilterKey, !checked);
};
</script>

<template>
  <div class="wrap">
    <Title>学习途径过滤</Title>
    <ul>
      <li
        v-for="(checked, type, i) in filterTypes"
        :key="type"
        class="type"
        :class="{ lighter: i % 2 === 0 }"
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
/* --- 修改：开启横向滚动并防止换行，以适配分类类型过多的情况 --- */
.wrap ul {
  display: flex;
  flex-wrap: nowrap;/* 从 wrap 改为 nowrap */
  margin: 0;
  padding: 0 0 6px 0; /* 底部稍微留一点空间给滚动条 */
  flex-shrink: 0;
  list-style: none;
  overflow-x: auto; /* 开启横向滚动 */
}

/* --- 新增：美化滚动条，使其适配网页的暗色主题 --- */
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

/* --- 修改：固定单个分类的宽度，确保等比排列 --- */
.type {
  position: relative;
  padding: 10px 0 6px;
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
