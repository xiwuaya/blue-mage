<script setup lang="ts">
import { renderSpellMethod, encounterMap, questMap } from "../lib/spell";
import type { SpellMethod, MethodMapTarget } from "../lib/spell";
import { typeIcon } from "../icon";
import mapIcon from "../assets/icons/map.svg";
import { computed, ref } from "vue";

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
  (e: "openMap", method: MethodMapTarget): void;
}>();

const encounter = computed(() => encounterMap(props.method));
const pickup = computed(() => questMap(props.method));
const pickupPreview = computed(() => {
  if (!pickup.value) return "";
  const { label, map, positions } = pickup.value;
  const [x, y] = positions[0];
  return `${label} · ${map} (X:${x}, Y:${y})`;
});
const previewDismissed = ref(false);

function openMap(target?: MethodMapTarget) {
  if (target) emit("openMap", target);
}

// 2. 提取地点或副本名称作为搜索关键词，过滤掉特殊途径（因为描述太长）
const searchKeyword = computed(() => {
  // --- 新增：如果是 fate 类型，强制优先使用 map 字段 ---
  if (props.method.type === 'fate' && 'map' in props.method && props.method.map) {
      return props.method.map;
    }
  // ----------------------------------------------------

  // 其他类型保持原有的优先级：有 name 取 name，没有 name 取 map
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
    <img class="type" :src="typeIcon(props.method.type)" />
    
    <span 
      :style="{ color: textColor }"
      :class="{ clickable: !!searchKeyword }"
      @click="handleSearch"
      :title="searchKeyword ? `点击搜索相同途径：${searchKeyword}` : ''"
    >
      {{ text }} <sup>Lv.{{ props.method.level }}</sup>
    </span>

    <button v-if="encounter" class="map-button" type="button"
      :title="method.type === 'map' ? '在地图中查看' : '查看刷新位置'"
      @click.stop="openMap(encounter)">
      <img class="map" :src="mapIcon" alt="" />
      {{ method.type === 'map' ? '地图' : `刷新点（${encounter.positions.length}）` }}
    </button>
    <span v-if="pickup" class="pickup">
      <button class="map-button pickup-button" type="button"
        :aria-label="`查看地图：${pickupPreview}`"
        @mouseenter="previewDismissed = false"
        @focus="previewDismissed = false"
        @keydown.esc="previewDismissed = true"
        @click.stop="previewDismissed = true; openMap(pickup)">
        <img class="map" :src="mapIcon" alt="" />
      </button>
      <span v-if="!previewDismissed" class="pickup-preview" aria-hidden="true">{{ pickupPreview }}</span>
    </span>

    <p v-if="!!props.method.note" class="note">{{ props.method.note }}</p>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
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

.map-button {
  background: transparent;
  color: #ffce68;
  border: 0;
  cursor: pointer;
  padding: 0 3px;
}

.pickup-button {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}
.pickup-button .map { margin: 0; }

.pickup-preview {
  display: none;
  position: absolute;
  z-index: 2;
  bottom: 100%;
  left: 0;
  width: max-content;
  max-width: 100%;
  box-sizing: border-box;
  padding: 5px 9px;
  border: 1px solid #666;
  border-radius: 4px;
  background: #252525;
  color: #fff;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
@media (hover: hover) {
  .pickup:hover .pickup-preview { display: block; }
}
.pickup-button:focus-visible + .pickup-preview { display: block; }

.map {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  vertical-align: middle;
  /* 悬停高亮：提亮图标 + 金色辉光（金色取自项目强调色 #ffbe31）
     这里用 filter 而不是项目其它图标用的 mask 方案：
     map.svg 作为 mask 时整块不可见，实测无效。 */
  filter: brightness(1);
  transition: filter 0.2s;
  cursor: pointer;
}

.map:hover {
  filter: brightness(1.4) drop-shadow(0 0 2px rgba(255, 190, 49, 0.85));
  transform: scale(1.1);
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