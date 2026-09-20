/**
 * @thewakingsands/eorzea-interactive-map 自带的是压缩后的 UMD 产物，
 * package.json 里没有 `types` 字段，所以这里手写声明。
 *
 * 只声明本项目实际用到的 API。返回类型来自对 dist/map.js 源码的实际阅读：
 *  - create()        → el.innerHTML="" 后 new L.Map，并 await getRegion()
 *  - map.loadMapKey  → await 后 mapInfo 才可用，且会清空已有 markers
 *  - simpleMarker    → 内部走 fromMapXY2D，接收"游戏内显示坐标"(1–42 量级)
 */
declare module "@thewakingsands/eorzea-interactive-map" {
  /** region.json 里的一条地图记录 */
  export interface EorzeaMapRegionMap {
    /** 地图资源 id，如 "s1f1/00"、"default/00"、"region/04" */
    id: string;
    /** 传给 loadMapKey 的数字 key */
    key: number;
    hierarchy: number;
    /** 大地图名，如 "中拉诺西亚" */
    name: string;
    /** 子区域名；主地图为空字符串 */
    subName: string;
    regionName: string;
  }

  export interface EorzeaMapRegion {
    regionName: string;
    maps: EorzeaMapRegionMap[];
  }

  /** map.json 中一条记录的字段（只列常用的） */
  export interface EorzeaMapInfo {
    /** 数字 key，以字符串形式存放 */
    "#": string;
    id: string;
    sizeFactor: number;
    placeName?: string;
    "placeName{Sub}"?: string;
    [key: string]: unknown;
  }

  /** 标记对象；本项目只把它交给 addMarker，不直接操作 */
  export interface EorzeaMapMarker {
    remove(): void;
  }

  export interface EorzeaMapInstance {
    /** 加载指定 key 的地图；会清空 this.markers，所以标记要在这之后再加 */
    loadMapKey(key: number): Promise<EorzeaMapInstance>;
    /** 注意：不是 addMaker（那是已废弃的错误拼写） */
    addMarker(marker: EorzeaMapMarker): EorzeaMapMarker;
    /** loadMapKey 完成后才有值 */
    mapInfo: EorzeaMapInfo;
    /** 把"显示坐标"换算为 Leaflet 坐标，配合 setView 使用 */
    mapToLatLng2D(x: number, y: number): unknown;
    setView(center: unknown, zoom?: number): EorzeaMapInstance;
    /** 继承自 Leaflet，关闭时必须调用以释放 window resize 监听等 */
    remove(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler?: (...args: unknown[]) => void): void;
  }

  /**
   * 创建地图。注意：
   *  - 会先清空容器 innerHTML
   *  - 内部会 await getRegion() 拉取 region.json，拿不到就会 reject
   *  - 容器必须有非零尺寸，且已插入 DOM
   */
  export function create(element: HTMLElement): Promise<EorzeaMapInstance>;

  /** 在"显示坐标" (x, y) 处创建标记 */
  export function simpleMarker(
    x: number,
    y: number,
    iconUrl: string,
    mapInfo: EorzeaMapInfo
  ): EorzeaMapMarker;

  /** 取全量区域/地图索引；内部 memoize，只会真正请求一次 */
  export function getRegion(): Promise<EorzeaMapRegion[]>;

  export const loader: {
    getIconUrl(path: string): string;
    [key: string]: unknown;
  };

  export const version: string;
  export const xy: (...args: unknown[]) => unknown;
  export const L: unknown;
}
