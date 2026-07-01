/**
 * 八字报告引擎
 * 
 * 复用风水 Report Engine 架构模式
 * 统一 8 大章节输出格式
 */

import type { BaZiPipelineResult, BaZiAIReport } from '../pipeline/types'
import type { BaZiKnowledgeEntry } from '../knowledge/types'

export interface BaZiReportSection {
  id: string
  title: string
  content: string
  knowledge?: BaZiKnowledgeEntry[]
}

export interface BaZiReport {
  title: string
  subtitle: string
  overallScore: number
  sections: BaZiReportSection[]
  summary: string
  suggestions: string[]
  luckyColors: string[]
  luckyDirections: string[]
  generatedAt: number
  version: string
}

/**
 * 生成八字报告
 * 
 * 统一 8 大章节：
 * 1. 性格分析
 * 2. 事业运势
 * 3. 财富运势
 * 4. 感情婚姻
 * 5. 健康运势
 * 6. 家庭六亲
 * 7. 大运流年
 * 8. 改运建议
 */
export function generateBaZiReport(
  pipelineResult: BaZiPipelineResult,
  aiReport?: BaZiAIReport | null
): BaZiReport {
  const { chart, geJu, xiYongShen, score, knowledge } = pipelineResult

  const sections: BaZiReportSection[] = [
    {
      id: 'personality',
      title: '性格分析',
      content: aiReport?.personality || buildPersonalityContent(chart, geJu),
      knowledge: knowledge.filter(k => k.category === 'tenGod').slice(0, 2),
    },
    {
      id: 'career',
      title: '事业运势',
      content: aiReport?.career || buildCareerContent(chart, geJu),
    },
    {
      id: 'wealth',
      title: '财富运势',
      content: aiReport?.wealth || buildWealthContent(chart, xiYongShen),
    },
    {
      id: 'relationship',
      title: '感情婚姻',
      content: aiReport?.relationship || buildRelationshipContent(chart),
    },
    {
      id: 'health',
      title: '健康运势',
      content: aiReport?.health || buildHealthContent(chart),
    },
    {
      id: 'family',
      title: '家庭六亲',
      content: aiReport?.family || buildFamilyContent(chart),
    },
    {
      id: 'luck',
      title: '大运流年',
      content: aiReport?.luck || buildLuckContent(chart, score),
      knowledge: knowledge.filter(k => k.category === 'luck').slice(0, 2),
    },
    {
      id: 'suggestions',
      title: '改运建议',
      content: '',
    },
  ]

  const suggestions = aiReport?.suggestions || buildDefaultSuggestions(xiYongShen)

  return {
    title: `${chart.dayMaster.dayGan}${chart.dayMaster.dayGanElement}日主命盘分析`,
    subtitle: `${chart.sixLines.year.gan}${chart.sixLines.year.zhi}年 ${chart.sixLines.month.gan}${chart.sixLines.month.zhi}月 ${chart.sixLines.day.gan}${chart.sixLines.day.zhi}日 ${chart.sixLines.hour.gan}${chart.sixLines.hour.zhi}时`,
    overallScore: score.overall,
    sections,
    summary: buildSummary(chart, geJu, xiYongShen, score),
    suggestions,
    luckyColors: getLuckyColors(xiYongShen?.firstHappy || '木'),
    luckyDirections: getLuckyDirections(xiYongShen?.firstHappy || '木'),
    generatedAt: Date.now(),
    version: '4.4.0',
  }
}

function buildPersonalityContent(chart: any, geJu: any): string {
  const element = chart.dayMaster?.dayGanElement || '土'
  const personalities: Record<string, string> = {
    '木': '您性格仁厚善良，有恻隐之心，为人正直，举止优雅。善于学习，思维敏捷，有上进心。但有时过于优柔寡断，需要培养决断力。',
    '火': '您性格热情奔放，有礼有节，富有感染力，行动迅速。口才出众，善于表达，适合社交和领导工作。但需注意控制情绪，避免急躁。',
    '土': '您性格稳重踏实，诚实守信，有包容心，重视承诺。做事认真负责，人缘好，适合稳定发展的工作。但有时过于保守，需要勇于突破。',
    '金': '您性格刚毅果断，讲义气，有原则，做事认真。组织能力强，适合管理和领导工作。但有时过于刚强，需要学会柔韧处事。',
    '水': '您性格聪明智慧，灵活变通，富有想象力，善于交际。适应能力强，多才多艺。但有时过于圆滑，需要坚守原则。',
  }
  return personalities[element] || personalities['土']
}

function buildCareerContent(chart: any, geJu: any): string {
  const strength = chart.dayMaster?.strengthScore || 50
  if (strength >= 70) {
    return '您的事业运势较强，有魄力有胆识，适合创业或从事管理工作。身旺能担财官，事业上容易有所成就。建议把握机遇，勇于开拓。'
  } else if (strength >= 40) {
    return '您的事业运势平稳，适合按部就班地发展。有一定的能力和责任心，在稳定的环境中更容易发挥优势。建议稳扎稳打，循序渐进。'
  } else {
    return '您的事业运势需要后天努力来弥补。身弱宜多学习提升自己，积累经验和人脉。适合从事技术、专业领域的工作，以技养身。'
  }
}

function buildWealthContent(chart: any, xiYongShen: any): string {
  return `您的财运中等，正财稳定，偏财需谨慎。喜${xiYongShen?.firstHappy || '木'}为用，建议在事业正途上求财，不宜投机冒险。财运需要靠勤劳积累，稳扎稳打更有利。`
}

function buildRelationshipContent(chart: any): string {
  return '您的感情运势平顺，需要多沟通理解，相互包容。感情中要学会换位思考，珍惜眼前人。缘分天注定，幸福靠经营。'
}

function buildHealthContent(chart: any): string {
  const element = chart.dayMaster?.dayGanElement || '土'
  const healthTips: Record<string, string> = {
    '木': '注意肝胆保养，少熬夜，多运动。饮食宜清淡，少吃油腻。保持心情舒畅，避免抑郁。',
    '火': '注意心脏和血液循环，避免过度劳累。饮食宜清淡，少吃辛辣。保持情绪稳定，避免大起大落。',
    '土': '注意脾胃消化，饮食要有规律。少吃生冷食物，多吃温热食物。适当运动，增强体质。',
    '金': '注意呼吸系统和皮肤保养。避免空气污染，多做深呼吸。饮食宜润肺，少吃辛辣。',
    '水': '注意肾脏和泌尿系统保养。多喝水，不要憋尿。注意保暖，尤其是腰部。',
  }
  return healthTips[element] || healthTips['土']
}

function buildFamilyContent(chart: any): string {
  return '家庭关系和睦，父母健康，子女孝顺。建议多花时间陪伴家人，家庭是您最重要的港湾。与亲戚朋友保持良好关系，人脉就是财脉。'
}

function buildLuckContent(chart: any, score: any): string {
  return `您的整体运势评分：${score.overall}/100。
大运走势稳中上升，把握机遇可有所成。
未来几年运势平稳，宜积蓄力量，厚积薄发。
流年运势起伏属正常现象，保持平常心即可。
记住：命由己造，运靠人为。积极的心态是最好的改运方法。`
}

function buildSummary(chart: any, geJu: any, xiYongShen: any, score: any): string {
  return `您是${chart.dayMaster?.dayGan}${chart.dayMaster?.dayGanElement}日主，格局为${geJu?.name || '正格'}。
喜用神为${xiYongShen?.firstHappy || '木'}，忌${xiYongShen?.avoidedElements?.join('、') || '金'}。
综合评分${score.overall}/100，属于中等偏上的命格。
命由己造，运靠人为。积极向善，努力奋斗，必能开创美好人生。`
}

function buildDefaultSuggestions(xiYongShen: any): string[] {
  return [
    `多穿${getElementColor(xiYongShen?.firstHappy || '木')}色系的衣服`,
    `居住或办公朝向${getElementDirection(xiYongShen?.firstHappy || '木')}方位更有利`,
    '保持积极乐观的心态，多行善事',
    '注重身体健康，规律作息',
    '多学习提升自我，增强自身实力',
  ]
}

function getLuckyColors(element: string): string[] {
  const colors: Record<string, string[]> = {
    '木': ['绿色', '青色', '碧色'],
    '火': ['红色', '紫色', '橙色'],
    '土': ['黄色', '棕色', '米色'],
    '金': ['白色', '金色', '银色'],
    '水': ['黑色', '蓝色', '灰色'],
  }
  return colors[element] || colors['土']
}

function getLuckyDirections(element: string): string[] {
  const directions: Record<string, string[]> = {
    '木': ['东方', '东南方'],
    '火': ['南方'],
    '土': ['中央', '西南方', '东北方'],
    '金': ['西方', '西北方'],
    '水': ['北方'],
  }
  return directions[element] || directions['土']
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    '木': '绿',
    '火': '红',
    '土': '黄',
    '金': '白',
    '水': '黑',
  }
  return colors[element] || '黄'
}

function getElementDirection(element: string): string {
  const directions: Record<string, string> = {
    '木': '东',
    '火': '南',
    '土': '中',
    '金': '西',
    '水': '北',
  }
  return directions[element] || '中'
}

export default generateBaZiReport
