/**
 * 命理规则引擎
 * 导出所有规则模块
 */

// 格局规则
export {
  GEJU_RULES,
  applyGeJuRules,
  calculateGeJuScore,
  isPoGe,
  type GeJuContext,
  type GeJuRule,
} from './gejuRules'

// 喜用神规则
export {
  XIYONG_RULES,
  applyXiYongRules,
  hasTiaoHouNeed,
  hasBingYaoNeed,
  type XiYongContext,
  type XiYongRule,
} from './xiyongRules'

// 十二长生规则
export {
  CHANG_SHENG_RULES,
  CHANG_SHENG_ORDER,
  CHANG_SHENG_START_CORRECTED,
  calculateChangSheng,
  applyChangShengRules,
  type ChangShengContext,
  type ChangShengRule,
} from './changshengRules'

// 十神规则
export {
  SHISHEN_RULES,
  calculateShenShi,
  applyShiShenRules,
  getAllShenShi,
  type ShenShiContext,
  type ShenShiRule,
} from './shishenRules'

// 六亲规则
export {
  LIUQIN_MAPPINGS,
  LIUQIN_RULES,
  getLiuQin,
  type LiuQinContext,
  type LiuQinMapping,
  type LiuQinRule,
} from './liuqinRules'

// 大运规则
export {
  DAYUN_RULES,
  calculateDaYunStart,
  generateDaYunSequence,
  isShun,
  applyDaYunRules,
  type DaYunContext,
  type DaYunResult,
  type DaYunRule,
} from './dashunRules'
