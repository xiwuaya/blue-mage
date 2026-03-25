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
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  yellow: "#ffff00",
  grey: "#C4C7C5"
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
</script>

<template>
  <div class="wrap">
    <img class="type" :src="`icons/type_${props.method.type}.png`" />
    
    <span :style="{ color: textColor }">
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
</style>