/**
 * Core Domain 基础类型定义
 * Single Source of Truth — 全项目唯一类型来源
 *
 * 所有模块（bazi / fengshui / database / api / ui）必须从此导入基础类型
 * 禁止在其他文件中重复定义这些类型
 */

// ─── 天干地支 ───

export type HeavenlyStem =
  | '甲' | '乙' | '丙' | '丁' | '戊'
  | '己' | '庚' | '辛' | '壬' | '癸'

export type EarthlyBranch =
  | '子' | '丑' | '寅' | '卯' | '辰'
  | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'

// ─── 五行阴阳 ───

export type FiveElement = '木' | '火' | '土' | '金' | '水'

export type YinYang = '阳' | '阴'

// ─── 十神 ───

export type ShenShi =
  | '比肩' | '劫财' | '食神' | '伤官'
  | '偏财' | '正财' | '偏官' | '正官'
  | '偏印' | '正印'

// ─── 纳音 ───

export type NaYin = string

// ─── 十二长生 ───

export type ShiErChangSheng =
  | '长生' | '沐浴' | '冠带' | '临官' | '帝旺'
  | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养'

// ─── 五行旺衰 ───

export type WuXingWangShuai = '旺' | '相' | '休' | '囚' | '死'

// ─── 二十四节气 ───

export type SolarTermName =
  | '立春' | '雨水' | '惊蛰' | '春分'
  | '清明' | '谷雨' | '立夏' | '小满'
  | '芒种' | '夏至' | '小暑' | '大暑'
  | '立秋' | '处暑' | '白露' | '秋分'
  | '寒露' | '霜降' | '立冬' | '小雪'
  | '大雪' | '冬至' | '小寒' | '大寒'

// ─── 性别 ───

export type Gender = 'male' | 'female'

// ─── 历法类型 ───

export type CalendarType = 'solar' | 'lunar'

// ─── 子时策略（统一 ZiShiStrategyType + ZiShiStrategy）───

export type ZiShiStrategy = 'late' | 'early' | 'gregorian'

/**
 * @deprecated 使用 ZiShiStrategy 代替
 * 仅为向后兼容保留，Sprint C 后移除
 */
export type ZiShiStrategyType = ZiShiStrategy

// ─── 数据库枚举 ───

export type MembershipTier = 'free' | 'basic' | 'premium' | 'vip'
export type AnalysisType = 'basic' | 'full' | 'ai' | 'compatibility'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type FeedbackType = 'bug' | 'feature' | 'accuracy' | 'other'
export type FeedbackSeverity = 'low' | 'normal' | 'high' | 'critical'
export type FeedbackStatus = 'open' | 'processing' | 'resolved' | 'closed'
export type PaymentProductType = 'membership' | 'report' | 'addon' | 'credits'
export type PaymentMethod = 'wechat' | 'alipay' | 'stripe'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
