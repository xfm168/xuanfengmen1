/**
 * Core Utils 统一导出
 */

// 天干工具
export {
  getStemElement,
  getStemYinYang,
  isYangStem,
  isYinStem,
  getStemIndex,
  getStemByIndex,
  // 兼容别名
  getGanElement,
  getElement,
  getDayElement,
} from './stemUtils'

// 地支工具
export {
  getBranchElement,
  getBranchIndex,
  getBranchByIndex,
  getMonthBranchIndex,
  getMonthMainElement,
  // 兼容别名
  getZhiElement,
} from './branchUtils'

// 五行工具
export {
  getGenerated,
  getOvercame,
  getOvercomer,
  getGenerator,
  getWangShuai,
  getMotherElement,
  allElementsExcept,
  isSameElement,
  isGenerating,
  isOvercoming,
} from './wuxingUtils'
