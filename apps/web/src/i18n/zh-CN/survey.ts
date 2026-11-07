import type { Messages } from '../messages.ts'

export const survey: Messages['survey'] = {
  title: '玩得怎么样？',
  note: '你的回答和这次退出会发给开发者。',
  issues: '游玩时遇到问题了吗？',
  likes: '有喜欢的地方吗？',
  send: '发送',
  sending: '发送中…',
  skip: '跳过',
  sent: '谢谢。你的回答已发送。',
  failed: (p0) => `未发送。${p0}`,
  offline: '无法连接服务器，请重试。',
  empty: '至少回答一个问题。',
  noExit: '没有可反馈的退出。',
}
