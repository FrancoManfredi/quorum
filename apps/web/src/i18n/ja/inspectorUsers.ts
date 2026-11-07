import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: 'リクエスト',
  sOk: (p0, p1, p2) => `${p0}/s · ${p1} 成功${p2}`,
  errorsByCause: '原因別エラー',
  s: (p0) => `${p0}/s`,
  users: 'ユーザー',
  market: '市場',
  apdexNow: 'Apdex現在',
  apdexLastHour: 'Apdex · 直近1時間',
  velocity: '開発速度',
  percentileLine: (mean, p50, p95, p99) => `平均${mean} · p50 ${p50} · p95 ${p95} · p99 ${p99}`,
  causes: {
    dropped: '破棄',
    stranded: '行き場なし',
    refused: '拒否',
    down: '停止',
    stale: '陳腐化',
    oom: 'メモリ不足',
    timeout: 'タイムアウト',
    crash: 'クラッシュ',
    blocked: 'ブロック',
    upstream: '上流',
    throttled: '制限',
    duplicate: '重複',
  },
}
