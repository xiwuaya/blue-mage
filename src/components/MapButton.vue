<script setup lang="ts">
import { computed, ref } from "vue";
import type { MethodMapTarget } from "../lib/spell";
import mapIcon from "../assets/icons/map.svg";

const props = defineProps<{ target: MethodMapTarget; purpose?: string }>();
const emit = defineEmits<{ (e: "open", target: MethodMapTarget): void }>();
const dismissed = ref(false);
const preview = computed(() => {
  const { label, map, positions } = props.target;
  const heading = [props.purpose, label, map].filter(Boolean).join(" · ");
  const coordinates = positions.slice(0, 3).map(([x, y, z]) =>
    `(X:${x}, Y:${y}${z ? `, Z:${z}` : ""})`
  ).join("、");
  if (positions.length === 1) return `${heading} ${coordinates}`;
  return `${heading} · 共 ${positions.length} 个位置：${coordinates}${positions.length > 3 ? "…" : ""}`;
});

function open() {
  dismissed.value = true;
  emit("open", props.target);
}
</script>

<template>
  <span class="map-entry">
    <button class="map-button" type="button" :aria-label="`查看地图：${preview}`"
      @mouseenter="dismissed = false" @focus="dismissed = false"
      @keydown.esc="dismissed = true" @click.stop="open">
      <img :src="mapIcon" alt="" />
    </button>
    <span v-if="!dismissed" class="map-preview" aria-hidden="true">{{ preview }}</span>
  </span>
</template>

<style scoped>
.map-button {
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  vertical-align: middle;
}
.map-button img {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}
.map-button:hover img {
  filter: brightness(1.4) drop-shadow(0 0 2px rgba(255, 190, 49, 0.85));
}
.map-preview {
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
  .map-entry:hover .map-preview { display: block; }
}
.map-button:focus-visible + .map-preview { display: block; }
</style>
