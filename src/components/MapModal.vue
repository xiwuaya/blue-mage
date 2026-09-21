<script setup lang="ts">
// 顺序要紧：leaflet 的布局样式必须在地图库主题之前引入
import "leaflet/dist/leaflet.css";
import "@thewakingsands/eorzea-interactive-map/dist/map.css";

import { ref, watch, nextTick } from "vue";
import type { ComponentPublicInstance } from "vue";
import * as eorzeaMap from "@thewakingsands/eorzea-interactive-map";
import type { EorzeaMapInstance } from "@thewakingsands/eorzea-interactive-map";
import { resolveMapKey } from "@/lib/map";
import type { SpellMethodMap } from "@/lib/spell";

const props = defineProps<{
  show: boolean;
  spellName: string;
  method: SpellMethodMap;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const loading = ref(false);
const error = ref("");

/**
 * 用函数 ref 而不是 `ref="mapElement"` 字符串 ref。
 * 本项目的 Vue 3.2 + Volar 0.31 + TS 4.5 组合下，
 * 字符串模板 ref 会让 mapElement.value 被推断成一份结构上"像"HTMLElement
 * 但并不等同的类型，传给库的 create(el) 会报 TS2345。
 */
let mapEl: HTMLElement | null = null;
const setMapElement = (el: Element | ComponentPublicInstance | null) => {
  mapEl = el as HTMLElement | null;
};

const x = () => props.method.position[0];
const y = () => props.method.position[1];

let instance: EorzeaMapInstance | null = null;
/**
 * 每次打开自增，用于丢弃"弹窗已关闭但异步流程还没走完"的过期结果
 */
let runToken = 0;

function destroyMap() {
  if (!instance) return;
  try {
    // 继承自 Leaflet：注销 window resize 监听、移除 pane/control
    instance.remove();
  } catch (e) {
    console.warn("地图实例销毁失败", e);
  }
  instance = null;
}

async function openMap() {
  const token = ++runToken;

  // Transition 是先渲染再过渡，容器需要等一帧才有尺寸
  await nextTick();
  if (token !== runToken) return;

  const el = mapEl;
  if (!el) return;

  /** 只有还属于当前这一轮时才收起遮罩 */
  const done = () => {
    if (token === runToken) loading.value = false;
  };

  loading.value = true;
  error.value = "";

  try {
    // create() 会清空容器 innerHTML，并内部拉取 region.json（失败即 reject）
    const map = await eorzeaMap.create(el);
    if (token !== runToken) {
      // 创建过程中弹窗已被关闭
      try {
        map.remove();
      } catch {
        /* 忽略 */
      }
      return;
    }
    instance = map;

    const key = await resolveMapKey(props.method.map);
    if (token !== runToken) return;

    if (key === null) {
      error.value = `未找到地图「${props.method.map}」（可能是地名有误）`;
      done();
      return;
    }

    // 注意顺序：loadMapKey 会清空已有 markers，标记必须在这之后添加
    await map.loadMapKey(key);
    if (token !== runToken) return;

    const iconUrl = eorzeaMap.loader.getIconUrl("ui/icon/060000/060561.tex");
    // position[0]/[1] 已经是游戏内显示坐标，直接使用，不做任何换算
    map.addMarker(eorzeaMap.simpleMarker(x(), y(), iconUrl, map.mapInfo));

    // animate: false —— 关掉平移动画。
    //
    // 库在 loadMapKey 内部会先 panTo 到地图中心，本项目的 setView 排在它之后才生效。
    // 如果带平移动画，视图会有一段肉眼可见的"慢慢挪过去"的过程（实测单实例约 800ms，
    // 网络拥塞时更长），用户就会看到标记先偏在一边、再飘到正确位置。
    // 关掉动画后是一次到位，不存在那段中间状态，也就不必为了遮住它而把加载遮罩一直挂着。
    map.setView(map.mapToLatLng2D(x(), y()), 0, { animate: false });
    done();
  } catch (e) {
    if (token !== runToken) return;
    console.error("地图加载失败", e);
    error.value = "地图加载失败，请检查网络后重试";
    done();
  }
}

function handleClose() {
  // 自增 token，让进行中的异步流程失效
  runToken++;
  destroyMap();
  emit("close");
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      openMap();
    } else {
      runToken++;
      destroyMap();
    }
  },
  { immediate: true }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-backdrop" @click.self="handleClose">
        <div class="modal-content map-modal">
          <button class="close-btn" @click="handleClose" title="关闭弹窗">&times;</button>

          <div class="map-info">
            <div class="map-info-main">
              {{ spellName }} · {{ method.mob }} Lv.{{ method.level }}
            </div>
            <div class="map-info-sub">
              {{ method.map }} (x:{{ x() }}, y:{{ y() }})
            </div>
          </div>

          <!-- 容器必须有显式尺寸，库不提供任何宽高样式 -->
          <div :ref="setMapElement" class="map-container"></div>

          <div v-if="loading" class="map-overlay">地图加载中…</div>
          <div v-else-if="error" class="map-overlay map-error">{{ error }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.map-modal {
  /* box-sizing + calc(100% - 32px)：保证窄屏时左右各留 16px 边距。
     实测原来在 360px 下是 left=0 right=360，弹窗贴满整屏没有留白。 */
  box-sizing: border-box;
  width: min(900px, calc(100% - 32px));
  /* 覆盖全局 .modal-content 的 max-width: 500px */
  max-width: none;
  padding: 20px;
}

.map-info {
  margin-bottom: 12px;
  padding-right: 30px;
}

.map-info-main {
  color: #ffbe31;
  font-size: 1rem;
  line-height: 22px;
}

.map-info-sub {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 20px;
}

.map-container {
  width: 100%;
  height: 60vh;
  /* dvh：移动端地址栏收起/展开时不会让地图高度跳动。
     不支持的浏览器会忽略这行，沿用上面的 60vh。 */
  height: 60dvh;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden;
}

.map-overlay {
  margin-top: 10px;
  text-align: center;
  color: #ccc;
  font-size: 0.9rem;
}

.map-error {
  color: #ff4c4c;
}
</style>
