/**
 * 风水模拟引擎 - 类型定义
 * 
 * @deprecated 此模块为实验性功能，当前版本未启用。
 *             保留以备未来 Premium 版本、实验模式或 AB Test 使用。
 *             请勿在生产环境直接调用。
 */

import type { FengShuiContext } from '../types'
import type { RuleExecutionInput, FengShuiRuleResult } from '../rules/types'
import type { ScoreEngineInput, ScoreEngineResult } from '../score-engine/types'

export interface SimulationParams {
  baseContext: FengShuiContext
  changes: SimulationChange[]
  iterations?: number
}

export interface SimulationChange {
  type: 'furniture' | 'layout' | 'color' | 'direction'
  target: string
  action: 'add' | 'remove' | 'move' | 'modify'
  value?: unknown
}

export interface SimulationResult {
  originalScore: number
  modifiedScore: number
  scoreChange: number
  context: FengShuiContext
  scoreResult: ScoreEngineResult
  changesApplied: SimulationChange[]
}

export interface OptimizationSuggestion {
  id: string
  title: string
  description: string
  expectedImprovement: number
  difficulty: 'easy' | 'medium' | 'hard'
  changes: SimulationChange[]
}

export type { RuleExecutionInput, FengShuiRuleResult, ScoreEngineInput, ScoreEngineResult }
