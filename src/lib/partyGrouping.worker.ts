/**
 * 均衡组队算法 Web Worker：把可能长达数秒~数分钟的 DFS 完整枚举移出主线程，避免冻结 UI。
 *
 * 消息协议（结构化克隆）：
 *   入：FindBalancedPartyGroupsInput
 *   出：{ type: 'done'; result: PartyGroupResult | null } 或 { type: 'error'; message: string }
 */
import { findBalancedPartyGroups } from './partyGrouping';

self.onmessage = (e: MessageEvent) => {
  try {
    const result = findBalancedPartyGroups(e.data);
    (self as unknown as Worker).postMessage({ type: 'done', result });
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
