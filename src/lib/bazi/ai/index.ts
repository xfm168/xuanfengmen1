/**
 * 八字 AI 报告生成
 * 
 * 复用 V4.4 AI Provider 统一架构
 * - 统一 timeout
 * - 统一 retry
 * - 统一 error mapping
 * - 统一 logger
 */

import { logger } from '../../../utils/logger'
import { getAIService } from '../../../services/ai'
import type { AIMessage, AIResponse, AIModel } from '../../../services/ai/types'
import type { BaZiPipelineResult, BaZiAIReport } from '../pipeline/types'

const aiLogger = logger.child('BaziAI')

const BAZI_REPORT_SECTIONS = [
  '性格分析',
  '事业运势',
  '财富运势',
  '感情婚姻',
  '健康运势',
  '家庭六亲',
  '大运流年',
  '改运建议',
]

export interface BaZiAIReportOptions {
  model?: AIModel
  language?: 'zh' | 'en'
  detailLevel?: 'basic' | 'standard' | 'detailed'
}

/**
 * 生成八字 AI 报告
 * 
 * 复用统一 AI Provider
 */
export async function generateBaZiAIReport(
  pipelineResult: BaZiPipelineResult,
  options: BaZiAIReportOptions = {}
): Promise<BaZiAIReport> {
  const { chart, geJu, xiYongShen, score } = pipelineResult

  aiLogger.info('开始生成八字 AI 报告')

  const prompt = buildBaZiPrompt(chart, geJu, xiYongShen, score, options)

  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `你是一位专业的八字命理师，精通传统命理学和现代心理学。
请用专业、客观、积极的语言为用户分析八字。
输出格式为 JSON，包含以下字段：
personality, career, wealth, relationship, health, family, luck, suggestions(字符串数组)

注意事项：
1. 语言专业但通俗易懂
2. 多讲积极面，少讲消极面
3. 建议要具体可行
4. 不要说"命由天定"之类的话
5. 强调"命由己造，运靠人为"`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]

    const response: AIResponse = await getAIService().chat(messages, {
      model: options.model,
      metadata: { type: 'bazi_report' },
    })

    const report = parseAIResponse(response.content)

    aiLogger.info('八字 AI 报告生成完成')

    return report
  } catch (err) {
    aiLogger.error('AI 报告生成失败', err)
    return getFallbackReport()
  }
}

function buildBaZiPrompt(
  chart: any,
  geJu: any,
  xiYongShen: any,
  score: any,
  options: BaZiAIReportOptions
): string {
  const { sixLines, dayMaster } = chart

  return `请分析以下八字命盘：

【基本信息】
日主：${dayMaster.dayGan}${dayMaster.dayGanElement}
性别：${chart.birthInfo?.gender || '未知'}
出生：${chart.birthInfo?.birthDate || '未知'} ${chart.birthInfo?.birthTime || '未知'}

【四柱】
年柱：${sixLines.year.gan}${sixLines.year.zhi}（${sixLines.year.naYin}）
月柱：${sixLines.month.gan}${sixLines.month.zhi}（${sixLines.month.naYin}）
日柱：${sixLines.day.gan}${sixLines.day.zhi}（${sixLines.day.naYin}）
时柱：${sixLines.hour.gan}${sixLines.hour.zhi}（${sixLines.hour.naYin}）

【十神】
年干：${sixLines.year.shenShi || '未知'}
月干：${sixLines.month.shenShi || '未知'}
日干：${sixLines.day.shenShi || '未知'}
时干：${sixLines.hour.shenShi || '未知'}

【旺衰】
旺衰状态：${dayMaster.wangShuai || '未知'}
力量评分：${dayMaster.strengthScore || 0}/100

【格局】
格局名称：${geJu.name || '正格'}
格局描述：${geJu.description || ''}

【喜用神】
喜神：${xiYongShen.firstHappy || ''} ${xiYongShen.secondHappy || ''} ${xiYongShen.thirdHappy || ''}
用神：${xiYongShen.firstUsage || ''} ${xiYongShen.secondUsage || ''}
忌神：${xiYongShen.avoidedElements?.join('、') || ''}

【五行分布】
木：${chart.fiveElementCount?.['木']?.toFixed(1) || 0}
火：${chart.fiveElementCount?.['火']?.toFixed(1) || 0}
土：${chart.fiveElementCount?.['土']?.toFixed(1) || 0}
金：${chart.fiveElementCount?.['金']?.toFixed(1) || 0}
水：${chart.fiveElementCount?.['水']?.toFixed(1) || 0}

【综合评分】
总评：${score.overall || 0}/100

请从以下8个方面详细分析：
1. 性格分析
2. 事业运势
3. 财富运势
4. 感情婚姻
5. 健康运势
6. 家庭六亲
7. 大运流年（简述未来5年趋势）
8. 改运建议（至少5条具体建议）

请用专业但通俗的语言，输出JSON格式。`
}

function parseAIResponse(content: string): BaZiAIReport {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        personality: parsed.personality || '',
        career: parsed.career || '',
        wealth: parsed.wealth || '',
        relationship: parsed.relationship || '',
        health: parsed.health || '',
        family: parsed.family || '',
        luck: parsed.luck || '',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      }
    }
  } catch {
    // 解析失败，返回 fallback
  }

  return getFallbackReport()
}

function getFallbackReport(): BaZiAIReport {
  return {
    personality: '您的八字格局显示出独特的性格特质，具体分析需要结合更多信息。',
    career: '事业运势平稳，建议稳步发展，不宜冒进。',
    wealth: '财运中等，正财稳定，偏财需谨慎。',
    relationship: '感情运势平顺，需多沟通理解。',
    health: '身体总体健康，注意作息规律。',
    family: '家庭关系和睦，需多陪伴家人。',
    luck: '运势稳中上升，把握机遇可有所成。',
    suggestions: [
      '保持积极乐观的心态',
      '注重身体健康，规律作息',
      '多学习提升自我',
      '与人为善，广结善缘',
      '脚踏实地，稳步前行',
    ],
  }
}

export { BAZI_REPORT_SECTIONS }
export default generateBaZiAIReport
