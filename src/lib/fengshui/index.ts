/**
 * 玄风风水模块 V4.4 Release
 * 
 * Architecture:
 * Pipeline → Feature → Rule → Knowledge → Evidence → Report
 * 
 * Modules:
 * - Pipeline: Unified entry point (runFullPipeline)
 * - Vision Module: Integrated into Pipeline
 * - Deprecated Simulation: Reserved for Premium/AB Test
 * - AI Provider: OpenAI/Gemini/Supabase Edge (unified timeout)
 * - Rule Engine: 101 rules (ALL_RULES)
 * - Knowledge Base: 76 entries (knowledgeBase)
 * 
 * @example
 * // 图片分析完整流程（推荐入口）
 * import { runFullPipeline } from '@/lib/fengshui'
 * 
 * const result = await runFullPipeline({
 *   imageData: imageBase64,
 *   roomType: 'living',
 *   mode: 'standard',
 * })
 * 
 * @example
 * // 规则库访问
 * import { ALL_RULES, RULE_STATS } from '@/lib/fengshui'
 * console.log(RULE_STATS.total) // 101
 */

export type * from './types'
export { ALL_RULES, RULES_BY_ROOM, RULE_STATS, executeRules } from './rules'
export { runFullPipeline, PIPELINE_STEPS } from './pipeline'
export type { PipelineStep, PipelineInput, PipelineOutput, PipelineReport, ReportSection } from './pipeline'
export { buildEvidenceChain, evidenceChainToMarkdown } from './evidenceChain'
export { knowledgeBase } from './knowledge'
export type { KnowledgeEntry, FengShuiCase, SchoolInfo, PlantKnowledge, ColorKnowledge, MaterialKnowledge, SymbolKnowledge } from './knowledge'

import type { FengShuiContext, Direction, Room, Furniture } from './types'

/**
 * 创建默认风水上下文
 */
export function createDefaultContext(partial?: Partial<FengShuiContext>): FengShuiContext {
  return {
    houseType: partial?.houseType || 'apartment',
    houseAge: partial?.houseAge || 5,
    totalFloors: partial?.totalFloors || 30,
    currentFloor: partial?.currentFloor || 10,
    totalArea: partial?.totalArea || 100,
    
    direction: partial?.direction || {
      mainDirection: 'south',
      facingDirection: 'north',
      doorDirection: 'south',
    },
    
    layout: partial?.layout || {
      shape: 'square',
      score: 80,
      missingCorners: [],
      totalArea: 100,
      usableArea: 90,
    },
    
    rooms: partial?.rooms || [],
    
    elementDistribution: partial?.elementDistribution || {
      '木': 2,
      '火': 2,
      '土': 2,
      '金': 2,
      '水': 2,
    },
    
    nearbyRoads: partial?.nearbyRoads || 0,
    nearbyTJunction: partial?.nearbyTJunction || false,
    nearbyPole: partial?.nearbyPole || false,
    nearWater: partial?.nearWater || false,
    nearMountain: partial?.nearMountain || false,
    
    ownerBazi: partial?.ownerBazi,
  }
}
