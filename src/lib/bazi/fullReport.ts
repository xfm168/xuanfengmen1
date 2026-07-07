import type {
  SixLines, HeavenlyStem, EarthlyBranch,
  FiveElement, ShenShi, BaZiAnalysis
} from './types'
import type { GeJuResult } from './geju'
import type { ShenShiAnalysisResult } from './shishenAnalysis'
import type { FiveElementPowerResult } from './fiveElementPower'
import type { ShenShaCategory } from './shensha'
import type { WangShuaiResult } from './wangshuai'
import type { MarriageAnalysisResult } from './marriageAnalysis'
import type { CareerAnalysisResult } from './careerAnalysis'
import type { WealthAnalysisResult } from './wealthAnalysis'
import type { HealthAnalysisResult } from './healthAnalysis'
import type { FengShuiAnalysisResult } from './fengshuiAnalysis'

export interface ReportChapter {
  id: string
  title: string
  content: string
}

export interface FullReportResult {
  title: string
  subtitle: string
  chapters: ReportChapter[]
  wordCount: number
}

export interface FullReportInput {
  chart: BaZiAnalysis
  sixLines: SixLines
  dayMaster: { dayGan: HeavenlyStem; dayGanElement: FiveElement; wangShuai: string; strengthScore: number }
  geJu: GeJuResult
  wangShuai: WangShuaiResult
  shenShiAnalysis: ShenShiAnalysisResult
  fiveElementPower: FiveElementPowerResult
  shenSha: ShenShaCategory[]
  xiYongShen: { bestElement: FiveElement; avoidedElements: FiveElement[] }
  marriage: MarriageAnalysisResult
  career: CareerAnalysisResult
  wealth: WealthAnalysisResult
  health: HealthAnalysisResult
  fengshui: FengShuiAnalysisResult
}

function generateChapter1_overview(input: FullReportInput): string {
  const { chart, dayMaster, sixLines } = input
  const lines = [
    `## 一、命局概况`,
    ``,
    `命主生于${chart.sixLines.year.gan}${chart.sixLines.year.zhi}年、${chart.sixLines.month.gan}${chart.sixLines.month.zhi}月、${chart.sixLines.day.gan}${chart.sixLines.day.zhi}日、${chart.sixLines.hour.gan}${chart.sixLines.hour.zhi}时。`,
    ``,
    `日主为${dayMaster.dayGan}，五行属${dayMaster.dayGanElement}。${dayMaster.dayGanElement}主仁、主礼、主信、主义、主智，${getElementPersonality(dayMaster.dayGanElement)}。`,
    ``,
    `四柱纳音：`,
    `- 年柱${sixLines.year.naYin}`,
    `- 月柱${sixLines.month.naYin}`,
    `- 日柱${sixLines.day.naYin}`,
    `- 时柱${sixLines.hour.naYin}`,
    ``,
    `此命局天干地支组合独特，蕴含着丰富的人生信息。下面将从旺衰、格局、十神、神煞、喜用神等多个维度进行深入剖析。`,
  ]
  return lines.join('\n')
}

function generateChapter2_wangshuai(input: FullReportInput): string {
  const { wangShuai, dayMaster } = input
  const lines = [
    `## 二、旺衰分析`,
    ``,
    `日主${dayMaster.dayGan}（${dayMaster.dayGanElement}）的旺衰状态为：**${dayMaster.wangShuai}**。`,
    ``,
    `旺衰力量评分：**${dayMaster.strengthScore}分**。`,
    ``,
    `**得令分析**：${wangShuai.deLing ? '得令' : '不得令'}。月令为${wangShuai.yueLing}，${dayMaster.dayGanElement}在${wangShuai.yueLing}月${wangShuai.deLing ? '当令而旺' : '失令而弱'}。`,
    ``,
    `**得地分析**：${wangShuai.deDi ? '得地' : '不得地'}。`,
    ``,
    `**得势分析**：${wangShuai.deShi ? '得势' : '不得势'}。`,
    ``,
    `**通根分析**：${wangShuai.tongGen ? '有根' : '无根'}。`,
    ``,
    `综合判断：日主${dayMaster.wangShuai === '旺' || dayMaster.wangShuai === '强' ? '身旺，能担财官，适合开拓进取' : dayMaster.wangShuai === '弱' || dayMaster.wangShuai === '衰' ? '身弱，宜稳扎稳打，借助外力' : '中和，平衡发展，顺势而为'}。`,
  ]
  return lines.join('\n')
}

function generateChapter3_geju(input: FullReportInput): string {
  const { geJu } = input
  const lines = [
    `## 三、格局分析`,
    ``,
    `命局格局：**${geJu.name}**。`,
    ``,
    `${geJu.description}`,
    ``,
    `**成格条件**：${geJu.chengGe.join('、')}。`,
    ``,
    `**破格因素**：${geJu.poGe ? geJu.poGeReasons.join('、') : '无破格因素，格局清纯。'}`,
    ``,
    `**格局层次**：${geJu.level === 'high' ? '上格，格局高，富贵可期' : geJu.level === 'medium' ? '中格，格局尚可，努力可成' : '下格，格局普通，需后天努力'}。`,
  ]
  return lines.join('\n')
}

function generateChapter4_shishen(input: FullReportInput): string {
  const { shenShiAnalysis } = input
  const lines = [
    `## 四、十神分析`,
    ``,
    `主导十神：**${shenShiAnalysis.dominant}**。`,
    ``,
    `**十神力量详表**：`,
  ]
  for (const d of shenShiAnalysis.details) {
    lines.push(`- ${d.name}：${d.power}分 ${d.touGan ? '【透干】' : ''}${d.deLing ? '【得令】' : ''}${d.deDi ? '【得地】' : ''}${d.tongGen ? '【通根】' : ''}${d.shouZhi ? '【受制】' : ''}`)
  }
  lines.push(``)
  lines.push(`**人格特质**：${shenShiAnalysis.personality}`)
  lines.push(``)
  lines.push(`**性格倾向**：${shenShiAnalysis.character}`)
  lines.push(``)
  lines.push(`**职业倾向**：${shenShiAnalysis.career}`)
  lines.push(``)
  lines.push(`**婚恋特点**：${shenShiAnalysis.marriage}`)
  return lines.join('\n')
}

function generateChapter5_shensha(input: FullReportInput): string {
  const { shenSha } = input
  const lines = [
    `## 五、神煞分析`,
    ``,
    `命局神煞汇总：`,
    ``,
  ]
  for (const cat of shenSha) {
    const hitItems = cat.items.filter(i => i.inPosition)
    if (hitItems.length > 0) {
      lines.push(`**${cat.category}**：${hitItems.map(i => i.name).join('、')}`)
      for (const item of hitItems) {
        lines.push(`- ${item.name}：${item.description}`)
      }
      lines.push(``)
    }
  }
  return lines.join('\n')
}

function generateChapter6_xiyong(input: FullReportInput): string {
  const { xiYongShen, fiveElementPower } = input
  const lines = [
    `## 六、喜用神`,
    ``,
    `**喜用神**：${xiYongShen.bestElement}。`,
    ``,
    `**忌神**：${xiYongShen.avoidedElements.join('、')}。`,
    ``,
    `**五行力量分布**：`,
    `- 木：${fiveElementPower.powerMap['木']?.toFixed(1) || 0}`,
    `- 火：${fiveElementPower.powerMap['火']?.toFixed(1) || 0}`,
    `- 土：${fiveElementPower.powerMap['土']?.toFixed(1) || 0}`,
    `- 金：${fiveElementPower.powerMap['金']?.toFixed(1) || 0}`,
    `- 水：${fiveElementPower.powerMap['水']?.toFixed(1) || 0}`,
    ``,
    `喜用神${xiYongShen.bestElement}为命局所喜，能补命局之不足，增福添寿。日常生活中多接触${xiYongShen.bestElement}行相关的事物，有助于提升运势。`,
  ]
  return lines.join('\n')
}

function generateChapter7_marriage(input: FullReportInput): string {
  const { marriage } = input
  const lines = [
    `## 七、婚姻分析`,
    ``,
    `婚恋综合评分：**${marriage.score}分**。`,
    ``,
    `夫妻宫为日支${marriage.spousePalace.zhi}，五行属${marriage.spousePalace.element}。`,
    ``,
    `**夫妻宫关系**：`,
  ]
  for (const rel of marriage.relations) {
    lines.push(`- ${rel.type}（${rel.target}）：${rel.description}`)
  }
  lines.push(``)
  lines.push(`**婚姻神煞**：`)
  for (const ss of marriage.shenSha) {
    lines.push(`- ${ss.name}：${ss.inPosition ? '命中，位于' + ss.position : '未命中'}。${ss.description}`)
  }
  lines.push(``)
  lines.push(`**最佳结婚年龄**：${marriage.bestMarriageAge.min}岁至${marriage.bestMarriageAge.max}岁。`)
  lines.push(``)
  lines.push(`**婚姻风险**：`)
  for (const risk of marriage.risks) {
    lines.push(`- ${risk.type}（${risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险'}）：${risk.description}`)
  }
  lines.push(``)
  lines.push(`**改善建议**：`)
  for (const s of marriage.suggestions) {
    lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

function generateChapter8_wealth(input: FullReportInput): string {
  const { wealth } = input
  const lines = [
    `## 八、财富分析`,
    ``,
    `财富综合评分：**${wealth.score}分**。`,
    ``,
  ]
  if (wealth.zhengCai) {
    lines.push(`**正财**：${wealth.zhengCai.power}分。${wealth.zhengCai.description}`)
  }
  if (wealth.pianCai) {
    lines.push(`**偏财**：${wealth.pianCai.power}分。${wealth.pianCai.description}`)
  }
  lines.push(``)
  lines.push(`**财库**：${wealth.caiKu.hasCaiKu ? '命带财库（' + wealth.caiKu.caiKuZhi + '）' : '命中无财库'}。${wealth.caiKu.description}`)
  lines.push(``)
  lines.push(`**财运特征**：${wealth.louCai ? '有漏财之象' : '无漏财之忧'}；${wealth.poCai ? '有破财之险' : '无破财之忧'}。`)
  lines.push(``)
  lines.push(`**赚钱方式**：${wealth.moneyMakingStyle}`)
  lines.push(``)
  lines.push(`**投资方向**：`)
  for (const dir of wealth.investmentDirections) {
    lines.push(`- ${dir.direction}：${dir.score}分 ${dir.suitable ? '【适合】' : '【一般】'} ${dir.reason}`)
  }
  lines.push(``)
  lines.push(`**风险年份**：`)
  for (const ry of wealth.riskYears) {
    lines.push(`- ${ry.year}年（${ry.ganZhi}）：${ry.riskType} ${ry.description}`)
  }
  lines.push(``)
  lines.push(`**理财建议**：`)
  for (const s of wealth.suggestions) {
    lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

function generateChapter9_career(input: FullReportInput): string {
  const { career } = input
  const lines = [
    `## 九、事业分析`,
    ``,
    `事业综合评分：**${career.score}分**。`,
    ``,
    `**十神格局**：`,
  ]
  for (const ss of career.shishenScores.slice(0, 5)) {
    lines.push(`- ${ss.name}（${ss.role}）：${ss.power}分。${ss.description}`)
  }
  lines.push(``)
  lines.push(`**发展方向**：`)
  for (const dir of career.directions) {
    lines.push(`- ${dir.name}：${dir.score}分 ${dir.suitable ? '【适合】' : ''} ${dir.description}`)
  }
  lines.push(``)
  lines.push(`**适合行业**（Top 5）：`)
  for (const ind of career.industries.slice(0, 5)) {
    lines.push(`- ${ind.industry}：${ind.score}分 ${ind.reason}`)
  }
  lines.push(``)
  lines.push(`**最佳发展路径**：${career.bestPath}`)
  lines.push(``)
  lines.push(`**财富方向**：${career.wealthDirection}`)
  lines.push(``)
  lines.push(`**事业风险**：`)
  for (const r of career.risks) {
    lines.push(`- ${r}`)
  }
  lines.push(``)
  lines.push(`**发展建议**：`)
  for (const s of career.suggestions) {
    lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

function generateChapter10_health(input: FullReportInput): string {
  const { health } = input
  const lines = [
    `## 十、健康分析`,
    ``,
    `健康综合评分：**${health.score}分**。`,
    ``,
    `**体质类型**：${health.constitution.type}`,
    ``,
    `${health.constitution.description}`,
    ``,
    `**体质特征**：${health.constitution.characteristics.join('、')}`,
    ``,
    `**寒热状态**：${health.temperature.type}（${health.temperature.level}级）。${health.temperature.description}`,
    ``,
    `**燥湿状态**：${health.moisture.type}（${health.moisture.level}级）。${health.moisture.description}`,
    ``,
    `**易患疾病**：`,
  ]
  for (const d of health.diseaseRisks) {
    lines.push(`- ${d.organ}：${d.riskLevel === 'high' ? '高风险' : d.riskLevel === 'medium' ? '中风险' : '低风险'}。${d.description} 常见疾病：${d.diseases.join('、')}`)
  }
  lines.push(``)
  lines.push(`**饮食建议**：`)
  for (const diet of health.dietSuggestions) {
    lines.push(`- ${diet.category}：宜食${diet.recommend.join('、')}；忌食${diet.avoid.join('、')}。${diet.reason}`)
  }
  lines.push(``)
  lines.push(`**运动建议**：`)
  for (const ex of health.exerciseSuggestions) {
    lines.push(`- ${ex.type}：${ex.reason}`)
  }
  lines.push(``)
  lines.push(`**调理方案**：`)
  for (const r of health.regimens) {
    lines.push(`- ${r.aspect}：`)
    for (const s of r.suggestions) {
      lines.push(`  - ${s}`)
    }
  }
  return lines.join('\n')
}

function generateChapter11_dayun(input: FullReportInput): string {
  const { chart } = input
  const lines = [
    `## 十一、大运分析`,
    ``,
    `大运是人生十年一个阶段的运势走向。根据命局推算，命主的大运走势如下：`,
    ``,
    `**起运年龄**：${chart.dayMaster.yunStartAge}岁。`,
    ``,
    `大运反映了人生不同阶段的运势起伏。在好运期间，应积极进取，把握机遇；在逆运期间，应稳扎稳打，积蓄力量。`,
    ``,
    `大运与流年相互作用，构成了人生的运势图谱。了解自己的大运走势，有助于在人生的关键节点做出正确的决策。`,
  ]
  return lines.join('\n')
}

function generateChapter12_liunian(input: FullReportInput): string {
  const lines = [
    `## 十二、流年分析`,
    ``,
    `流年是每年的运势变化。根据命局推算，未来若干年的流年走势如下：`,
    ``,
    `流年运势起伏属正常现象，保持平常心即可。在吉年宜积极进取，在凶年宜保守稳健。`,
    ``,
    `流月分析可进一步细化每月的运势变化，帮助命主更好地把握时机。`,
  ]
  return lines.join('\n')
}

function generateChapter13_suggestions(input: FullReportInput): string {
  const { xiYongShen, fengshui, health, career, wealth, marriage } = input
  const lines = [
    `## 十三、改运建议`,
    ``,
    `综合以上分析，为命主提供以下改运建议：`,
    ``,
    `### 1. 五行调理`,
    ``,
    `喜用神为${xiYongShen.bestElement}，日常生活中可多接触${xiYongShen.bestElement}行相关的事物。`,
    ``,
    `**喜用颜色**：${fengshui.luckyColors.slice(0, 3).map(c => c.color).join('、')}。`,
    ``,
    `**忌讳颜色**：${fengshui.avoidColors.slice(0, 3).map(c => c.color).join('、')}。`,
    ``,
    `**幸运数字**：${fengshui.luckyNumbers.slice(0, 4).map(n => n.number).join('、')}。`,
    ``,
    `### 2. 方位调理`,
    ``,
    `吉方位：${fengshui.directions.slice(0, 2).map(d => d.position).join('、')}。`,
    ``,
    `住宅宜${fengshui.residence.bestFacing}朝向，坐${fengshui.residence.bestSitting}。`,
    ``,
    `### 3. 事业调理`,
    ``,
    ...career.suggestions.slice(0, 3).map(s => `- ${s}`),
    ``,
    `### 4. 财富调理`,
    ``,
    ...wealth.suggestions.slice(0, 3).map(s => `- ${s}`),
    ``,
    `### 5. 婚姻调理`,
    ``,
    ...marriage.suggestions.slice(0, 3).map(s => `- ${s}`),
    ``,
    `### 6. 健康调理`,
    ``,
    ...health.regimens.flatMap(r => r.suggestions.slice(0, 2).map(s => `- ${r.aspect}：${s}`)),
    ``,
    `### 7. 心态调理`,
    ``,
    `- 保持积极乐观的心态，相信美好的事情即将发生。`,
    `- 命由己造，运靠人为。积极的心态是最好的改运方法。`,
    `- 多行善事，广结善缘，福报自然来。`,
    `- 坚持学习，不断提升自我，增强自身实力。`,
    `- 珍惜当下，感恩所有，幸福就在身边。`,
    ``,
    `---`,
    ``,
    `*本报告由玄风 AI 命理系统自动生成，仅供参考。命理之说，信则有，不信则无。最重要的是保持积极的心态，努力奋斗，创造美好人生。*`,
  ]
  return lines.join('\n')
}

function getElementPersonality(element: FiveElement): string {
  const map: Record<FiveElement, string> = {
    '木': '性格仁厚，有恻隐之心，为人正直，举止优雅',
    '火': '性格热情，有礼有节，富有感染力，行动迅速',
    '土': '性格稳重，诚实守信，有包容心，重视承诺',
    '金': '性格刚毅，讲义气，有原则，做事认真',
    '水': '性格聪明，灵活变通，富有想象力，善于交际',
  }
  return map[element] || ''
}

export function generateFullReport(input: FullReportInput): FullReportResult {
  const chapters: ReportChapter[] = [
    { id: 'overview', title: '命局概况', content: generateChapter1_overview(input) },
    { id: 'wangshuai', title: '旺衰分析', content: generateChapter2_wangshuai(input) },
    { id: 'geju', title: '格局分析', content: generateChapter3_geju(input) },
    { id: 'shishen', title: '十神分析', content: generateChapter4_shishen(input) },
    { id: 'shensha', title: '神煞分析', content: generateChapter5_shensha(input) },
    { id: 'xiyong', title: '喜用神', content: generateChapter6_xiyong(input) },
    { id: 'marriage', title: '婚姻分析', content: generateChapter7_marriage(input) },
    { id: 'wealth', title: '财富分析', content: generateChapter8_wealth(input) },
    { id: 'career', title: '事业分析', content: generateChapter9_career(input) },
    { id: 'health', title: '健康分析', content: generateChapter10_health(input) },
    { id: 'dayun', title: '大运分析', content: generateChapter11_dayun(input) },
    { id: 'liunian', title: '流年分析', content: generateChapter12_liunian(input) },
    { id: 'suggestions', title: '改运建议', content: generateChapter13_suggestions(input) },
  ]

  const fullText = chapters.map(c => c.content).join('\n\n')
  const wordCount = fullText.length

  return {
    title: `${input.dayMaster.dayGan}${input.dayMaster.dayGanElement}日主完整命书`,
    subtitle: `${input.chart.sixLines.year.gan}${input.chart.sixLines.year.zhi}年 ${input.chart.sixLines.month.gan}${input.chart.sixLines.month.zhi}月 ${input.chart.sixLines.day.gan}${input.chart.sixLines.day.zhi}日 ${input.chart.sixLines.hour.gan}${input.chart.sixLines.hour.zhi}时`,
    chapters,
    wordCount,
  }
}
