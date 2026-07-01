import type { BaZiKnowledgeEntry, KnowledgeCategory, KnowledgeStats } from './types'

const TEN_GOD_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'shishen-bijian',
    category: 'tenGod',
    title: '比肩',
    content: '比肩为同我之五行，阴阳相同。代表兄弟朋友、同辈竞争、独立自主。身旺比肩多者，性格刚强自信，但易刚愎自用、与人争竞。身弱比肩为用者，多得朋友之助，事业有成。',
    source: '渊海子平',
    tags: ['十神', '比肩', '兄弟'],
  },
  {
    id: 'shishen-jiecai',
    category: 'tenGod',
    title: '劫财',
    content: '劫财为同我之五行，阴阳相异。代表财禄被夺、竞争激烈、合作风险。劫财旺者，花钱大方，不擅理财，易因朋友破财。但劫财也有积极进取、勇于开拓的一面。',
    source: '渊海子平',
    tags: ['十神', '劫财', '破财'],
  },
  {
    id: 'shishen-shishen',
    category: 'tenGod',
    title: '食神',
    content: '食神为我生之五行，阴阳相同。代表智慧才华、口福享受、温和宽厚。食神旺者，聪明多才，品味高雅，生活富足。食神为用，主长寿、多子、善饮食、有口福。',
    source: '三命通会',
    tags: ['十神', '食神', '智慧'],
  },
  {
    id: 'shishen-shangguan',
    category: 'tenGod',
    title: '伤官',
    content: '伤官为我生之五行，阴阳相异。代表才华横溢、叛逆创新、口才出众。伤官旺者，聪明外露，不喜约束，适合艺术、创作、销售等领域。但伤官过旺，易傲慢任性、得罪他人。',
    source: '三命通会',
    tags: ['十神', '伤官', '才华'],
  },
  {
    id: 'shishen-piancai',
    category: 'tenGod',
    title: '偏财',
    content: '偏财为我克之五行，阴阳相同。代表意外之财、偏门生意、投资投机。偏财旺者，财运广泛，善于抓住机会，常有意外收获。但偏财不稳定，来的快去的也快。',
    source: '穷通宝鉴',
    tags: ['十神', '偏财', '财运'],
  },
  {
    id: 'shishen-zhengcai',
    category: 'tenGod',
    title: '正财',
    content: '正财为我克之五行，阴阳相异。代表正当收入、稳定财富、勤俭持家。正财旺者，踏实肯干，财运稳定，适合正途求财。正财为用，主妻贤、家富、事业稳固。',
    source: '穷通宝鉴',
    tags: ['十神', '正财', '稳定'],
  },
  {
    id: 'shishen-pianguan',
    category: 'tenGod',
    title: '七杀',
    content: '七杀为克我之五行，阴阳相同。又称偏官。代表权威、压力、挑战、危机。七杀旺者，有魄力有胆识，适合军政、执法、创业等领域。但七杀过旺，易招灾祸、压力过大。',
    source: '渊海子平',
    tags: ['十神', '七杀', '权威'],
  },
  {
    id: 'shishen-zhengguan',
    category: 'tenGod',
    title: '正官',
    content: '正官为克我之五行，阴阳相异。代表官贵、名誉、责任、约束。正官旺者，品行端正，有责任感，适合公职、管理岗位。正官为用，主功名显达、社会地位高。',
    source: '渊海子平',
    tags: ['十神', '正官', '官贵'],
  },
  {
    id: 'shishen-pianyin',
    category: 'tenGod',
    title: '偏印',
    content: '偏印为生我之五行，阴阳相同。又称枭神。代表偏门学问、灵感直觉、孤独内省。偏印旺者，思维独特，适合研究、玄学、设计等领域。但偏印过旺，易孤僻多疑、与家人不和。',
    source: '三命通会',
    tags: ['十神', '偏印', '枭神'],
  },
  {
    id: 'shishen-zhengyin',
    category: 'tenGod',
    title: '正印',
    content: '正印为生我之五行，阴阳相异。代表学问、文书、长辈、贵人。正印旺者，学识渊博，品德高尚，多得长辈提携。正印为用，主学业有成、事业稳定、贵人相助。',
    source: '三命通会',
    tags: ['十神', '正印', '学问'],
  },
]

const ELEMENT_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'wuxing-wood',
    category: 'element',
    title: '木日主',
    content: '木日主之人，性格仁厚善良，有恻隐之心，为人正直，举止优雅。木旺者，身材修长，眉目清秀，声音洪亮。木弱者，身材瘦小，性格优柔寡断。木喜水生，忌金克。春木旺，秋木死。',
    source: '五行大义',
    tags: ['五行', '木', '日主'],
  },
  {
    id: 'wuxing-fire',
    category: 'element',
    title: '火日主',
    content: '火日主之人，性格热情奔放，有礼有节，富有感染力，行动迅速。火旺者，面色红润，精神饱满，口才出众。火弱者，面色偏暗，缺乏自信。火喜木生，忌水克。夏火旺，冬火死。',
    source: '五行大义',
    tags: ['五行', '火', '日主'],
  },
  {
    id: 'wuxing-earth',
    category: 'element',
    title: '土日主',
    content: '土日主之人，性格稳重踏实，诚实守信，有包容心，重视承诺。土旺者，体型敦厚，声音浑厚，人缘好。土弱者，体型偏瘦，性格多疑。土喜火生，忌木克。四季末月土旺，春土死。',
    source: '五行大义',
    tags: ['五行', '土', '日主'],
  },
  {
    id: 'wuxing-metal',
    category: 'element',
    title: '金日主',
    content: '金日主之人，性格刚毅果断，讲义气，有原则，做事认真。金旺者，骨骼清奇，皮肤白皙，声音清亮。金弱者，身材瘦小，缺乏魄力。金喜土生，忌火克。秋金旺，夏金死。',
    source: '五行大义',
    tags: ['五行', '金', '日主'],
  },
  {
    id: 'wuxing-water',
    category: 'element',
    title: '水日主',
    content: '水日主之人，性格聪明智慧，灵活变通，富有想象力，善于交际。水旺者，面黑有彩，智慧过人，适应力强。水弱者，面无光泽，缺乏主见。水喜金生，忌土克。冬水旺，夏水死。',
    source: '五行大义',
    tags: ['五行', '水', '日主'],
  },
]

const CLASSIC_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'classic-yuanhai',
    category: 'classic',
    title: '渊海子平',
    content: '宋代徐子平所著，八字命理学奠基之作。确立了以日干为主、月令为纲的论命体系。系统阐述了十神、格局、用神等核心概念，后世所有八字理论皆源于此。',
    source: '宋·徐子平',
    tags: ['古籍', '经典', '徐子平'],
  },
  {
    id: 'classic-sanming',
    category: 'classic',
    title: '三命通会',
    content: '明代万民英所著，八字命理学集大成之作。汇集了明朝以前所有命理学说，内容博大精深。对十神、格局、神煞、纳音等均有详细论述，是命理学百科全书。',
    source: '明·万民英',
    tags: ['古籍', '经典', '万民英'],
  },
  {
    id: 'classic-qiongtong',
    category: 'classic',
    title: '穷通宝鉴',
    content: '清代余春台所著，专论调候用神。以十天干生于十二月，各论喜忌。被誉为「命学之钥」，是八字调候派的经典著作。其核心思想是「调候为急」，先调候后格局。',
    source: '清·余春台',
    tags: ['古籍', '调候', '用神'],
  },
  {
    id: 'classic-ditian',
    category: 'classic',
    title: '滴天髓',
    content: '相传为宋代京图所著，明代刘伯温注。是八字命理学最高深的著作。以天道喻人道，论述命理学的哲学基础。文字精炼，意境深远，是命理高手必读之作。',
    source: '宋·京图',
    tags: ['古籍', '高级', '滴天髓'],
  },
]

const PATTERN_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'geju-zhengge',
    category: 'pattern',
    title: '正格',
    content: '正格又称八格，是八字最常见的格局。包括：正官格、七杀格、正印格、偏印格、正财格、偏财格、食神格、伤官格。正格以月令藏干透出取格，以日干与月支的关系论格局成败。',
    source: '渊海子平',
    tags: ['格局', '正格', '八格'],
  },
  {
    id: 'geju-congge',
    category: 'pattern',
    title: '从格',
    content: '从格是特殊格局，指日主极弱无依，只能顺从旺神。包括从财格、从杀格、从儿格、从势格等。从格成格条件极严，必须日主无根无比劫印星，且所从之神旺相。',
    source: '三命通会',
    tags: ['格局', '从格', '特殊'],
  },
  {
    id: 'geju-zuanwang',
    category: 'pattern',
    title: '专旺格',
    content: '专旺格是日主极旺的特殊格局。包括：曲直格（木）、炎上格（火）、稼穑格（土）、从革格（金）、润下格（水）。专旺格成格条件是日主一方独旺，无克泄，顺其气势为吉。',
    source: '三命通会',
    tags: ['格局', '专旺', '特殊'],
  },
  {
    id: 'geju-huaqi',
    category: 'pattern',
    title: '化气格',
    content: '化气格是天干相合化气的特殊格局。包括：甲己化土、乙庚化金、丙辛化水、丁壬化木、戊癸化火。化气格成格条件极严，必须化神得时得令，且无克制化神之物。',
    source: '渊海子平',
    tags: ['格局', '化气', '特殊'],
  },
]

const LUCK_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'yunshi-dayun',
    category: 'luck',
    title: '大运',
    content: '大运为十年一运，主管十年之吉凶。大运排法：阳年生男、阴年生女顺排；阴年生男、阳年生女逆排。从月柱起运，每运十年。大运是命局的延伸，决定人生各阶段的起伏。',
    source: '三命通会',
    tags: ['运势', '大运', '十年'],
  },
  {
    id: 'yunshi-liunian',
    category: 'luck',
    title: '流年',
    content: '流年为每一年的干支，主管一年之吉凶。流年与命局、大运共同作用，决定当年的运势吉凶。流年天干主外象、地支主内事。流年吉凶需结合大运、命局综合判断。',
    source: '渊海子平',
    tags: ['运势', '流年', '年度'],
  },
  {
    id: 'yunshi-liuyue',
    category: 'luck',
    title: '流月',
    content: '流月为每月的干支，主管一月之吉凶。流月在流年之下，受流年主导。流月天干主上半月、地支主下半月。流月运势需结合流年、大运、命局综合判断，以定一月之吉凶祸福。',
    source: '三命通会',
    tags: ['运势', '流月', '月度'],
  },
]

const STAR_ENTRIES: BaZiKnowledgeEntry[] = [
  {
    id: 'shensha-taohua',
    category: 'star',
    title: '桃花',
    content: '桃花主人缘、感情、魅力。查法：寅午戌见卯，亥卯未见子，申子辰见酉，巳酉丑见午。桃花坐命主相貌出众、人缘好。桃花为喜用，主感情美满、异性缘佳；为忌神，主桃花劫、感情纠纷。',
    source: '三命通会',
    tags: ['神煞', '桃花', '感情'],
  },
  {
    id: 'shensha-tianyi',
    category: 'star',
    title: '天乙贵人',
    content: '天乙贵人为第一贵神，主贵人相助、逢凶化吉。查法：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎，此是贵人方。命带天乙贵人，一生多遇贵人，遇难呈祥。',
    source: '渊海子平',
    tags: ['神煞', '贵人', '吉利'],
  },
  {
    id: 'shensha-wenchang',
    category: 'star',
    title: '文昌',
    content: '文昌主学业、文才、智慧。查法：甲见巳、乙见午、丙见申、丁见酉、戊见申、己见酉、庚见亥、辛见子、壬见寅、癸见卯。命带文昌，聪明好学，学业有成，适合文化教育事业。',
    source: '三命通会',
    tags: ['神煞', '文昌', '学业'],
  },
  {
    id: 'shensha-hongluan',
    category: 'star',
    title: '红鸾',
    content: '红鸾主婚姻喜事。查法：卯年见子、寅年见丑、丑年见寅、子年见卯、亥年见辰、戌年见巳、酉年见午、申年见未、未年见申、午年见酉、巳年见戌、辰年见亥。命带红鸾，主婚姻美满、喜事临门。',
    source: '三命通会',
    tags: ['神煞', '红鸾', '婚姻'],
  },
]

export const ALL_BAZI_KNOWLEDGE = [
  ...TEN_GOD_ENTRIES,
  ...ELEMENT_ENTRIES,
  ...CLASSIC_ENTRIES,
  ...PATTERN_ENTRIES,
  ...LUCK_ENTRIES,
  ...STAR_ENTRIES,
]

export function getKnowledgeStats(): KnowledgeStats {
  const byCategory: Record<KnowledgeCategory, number> = {
    classic: 0,
    tenGod: 0,
    pattern: 0,
    luck: 0,
    element: 0,
    star: 0,
    case: 0,
  }
  for (const entry of ALL_BAZI_KNOWLEDGE) {
    byCategory[entry.category]++
  }
  return {
    total: ALL_BAZI_KNOWLEDGE.length,
    byCategory,
  }
}

export function getKnowledgeById(id: string): BaZiKnowledgeEntry | undefined {
  return ALL_BAZI_KNOWLEDGE.find(e => e.id === id)
}

export function searchKnowledge(query: string, limit = 5): BaZiKnowledgeEntry[] {
  const q = query.toLowerCase()
  const results: BaZiKnowledgeEntry[] = []
  for (const entry of ALL_BAZI_KNOWLEDGE) {
    if (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some(t => t.toLowerCase().includes(q))
    ) {
      results.push(entry)
      if (results.length >= limit) break
    }
  }
  return results
}

export default {
  entries: ALL_BAZI_KNOWLEDGE,
  stats: getKnowledgeStats(),
  getById: getKnowledgeById,
  search: searchKnowledge,
}
