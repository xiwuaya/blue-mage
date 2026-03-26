<script setup lang="ts">
import { renderSpellMethod } from "../lib/spell";
import type { SpellMethod } from "../lib/spell";
import { computed } from "vue";

const props = defineProps<{
  method: SpellMethod;
}>();

const text = computed(() => renderSpellMethod(props.method));

//定义颜色别名映射表
const colorAliasMap: Record<string, string> = {
  red: "#ca3a3a",
  blue: "#0000ff",
  green: "#00ff00",
  yellow: "#ffff00",
  grey: "#666"
};

// 计算最终显示的颜色
const textColor = computed(() => {
  const color = props.method.color;
  // 如果没有配置 color 字段，缺省使用白色
  if (!color) {
    return "#ffffff"; 
  }
  // 将传入的值转为小写并在映射表中查找
  // 如果找到别名（例如 "red"），则返回对应的十六进制 ("#ff0000")
  // 如果找不到（说明传入的可能本身就是自定义的十六进制代码如 "#123456"），则直接返回原值
  return colorAliasMap[color.toLowerCase()] || color;
});

// 1. 定义向外抛出的 search 事件
const emit = defineEmits<{
  (e: "search", keyword: string): void;
}>();

// 2. 提取地点或副本名称作为搜索关键词，过滤掉特殊途径（因为描述太长）
const searchKeyword = computed(() => {
  if ('name' in props.method && props.method.name) return props.method.name;
  if ('map' in props.method && props.method.map) return props.method.map;
  return '';
});

// 3. 触发搜索事件
const handleSearch = () => {
  if (searchKeyword.value) {
    emit('search', searchKeyword.value);
  }
};

</script>

<template>
  <div class="wrap">
    <img class="type" :src="`icons/type_${props.method.type}.png`" />
    
    <span 
      :style="{ color: textColor }"
      :class="{ clickable: !!searchKeyword }"
      @click="handleSearch"
      :title="searchKeyword ? `点击搜索相同途径：${searchKeyword}` : ''"
    >
      {{ text }} <sup>Lv.{{ props.method.level }}</sup>
    </span>
    
    <p v-if="!!props.method.note" class="note">{{ props.method.note }}</p>
  </div>
</template>

<style scoped>
.wrap {
  margin: 0;
  line-height: 24px;
}

.type {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.note {
  margin: 0;
  line-height: 16px;
  font-size: 0.75rem;
  opacity: 0.75;
  margin-left: 20px;
}

/* 5. 新增可点击元素的交互样式 */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable:hover {
  opacity: 0.8;
  text-decoration: underline;
}
</style>