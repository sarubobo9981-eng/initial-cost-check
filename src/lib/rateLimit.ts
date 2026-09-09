/**
 * 簡易レート制限（本番公開前の最低限の安全対策・MVP向けの軽量実装）
 *
 * サーバーレス環境（Vercel等）ではインスタンスがリクエストごとに入れ替わる可能性があり、
 * メモリ上のカウンタは完全な制限を保証できない。そのため、これは唯一の防御手段ではなく、
 * 「スクリプトによる大量連続リクエストを軽減する」ための簡易的な安全対策として位置づける。
 * より厳密な制限が必要になった場合は、Redis等の外部ストアへの置き換えを検討すること。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

// メモリ肥大化を防ぐため、一定回数ごとに期限切れエントリを掃除する
let checksSinceCleanup = 0;
const CLEANUP_INTERVAL = 200;

export interface RateLimitOptions {
  /** 期間内に許可するリクエスト数 */
  limit: number;
  /** 期間の長さ（ミリ秒） */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** 制限にかかった場合、次に試せるまでの秒数の目安 */
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  checksSinceCleanup += 1;
  if (checksSinceCleanup >= CLEANUP_INTERVAL) {
    checksSinceCleanup = 0;
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt < now) buckets.delete(entryKey);
    }
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count += 1;
  return { allowed: true };
}

/** リクエストからクライアントIPを推定する（プロキシ環境のx-forwarded-forを優先） */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
