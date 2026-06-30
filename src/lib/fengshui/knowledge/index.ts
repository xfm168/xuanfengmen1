/**
 * 风水知识库 (Knowledge Base)
 * 
 * 架构：
 * Knowledge Base → Rule Engine → Explain Engine → AI Report → 产品
 * 
 * Rule 只保存 referenceId，Explain 从知识库读取
 * 
 * 未来支持 RAG（向量数据库检索）
 */

export * from './types'
export * from './classicIndex'
export * from './caseLibrary'
export * from './schoolLibrary'
export * from './explainEngine'

import { getKnowledgeStats, getKnowledgeOverview } from './explainEngine'
import { KNOWLEDGE_ENTRIES, CLASSIC_BOOKS, getBookById, getEntryById } from './classicIndex'
import { FENGSHUI_CASES, getCaseById } from './caseLibrary'
import { FENGSHUI_SCHOOLS, getSchoolById } from './schoolLibrary'

/**
 * 知识库总览
 */
export const knowledgeBase = {
  stats: getKnowledgeStats(),
  overview: getKnowledgeOverview(),
  books: CLASSIC_BOOKS,
  entries: KNOWLEDGE_ENTRIES,
  cases: FENGSHUI_CASES,
  schools: FENGSHUI_SCHOOLS,
  
  getBookById,
  getEntryById,
  getCaseById,
  getSchoolById,
}

export default knowledgeBase
