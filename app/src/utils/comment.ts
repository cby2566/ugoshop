/**
 * 评论数展示维度（优化清单 N3/N8）：原站列表页「评论 40」与详情页「评论(50)」
 * 各自硬编码、数字不同源。本函数为唯一数据源——确定性伪随机（同一 sid 恒取
 * 同值），列表页与详情页共用，两处入口数字保证一致。
 * 真实评论功能（评论表/列表）不在本站范围，故为确定性展示维度而非真数据。
 */
export function commentCount(sid: number): number {
  if (!Number.isFinite(sid) || sid <= 0) return 0
  return (sid * 37) % 89 + 8
}
