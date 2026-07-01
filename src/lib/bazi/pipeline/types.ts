/**
 * 八字 Pipeline 类型定义
 */

import type { BaZiChart, BirthInfo, XiYongShen } from '../types'
import type { GeJuResult } from '../geju'
import type { XiYongShenResult } from '../xiyongshen'
import type { BaZiKnowledgeEntry } from '../knowledge/types'

export interface BaZiAnalysisOptions {
  includeAI?: boolean
  detailed?: boolean
  includeLuck?: boolean
  years?: number
}

export interface BaZiPipelineStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  duration: number
  error?: string
}

export interface BaZiScore {
  overall: number
  strength: number
  balance: number
  pattern: number
}

export interface BaZiPipelineResult {
  chart: BaZiChart
  geJu: GeJuResult
  xiYongShen: XiYongShenResult
  score: BaZiScore
  knowledge: BaZiKnowledgeEntry[]
  steps: BaZiPipelineStep[]
  aiReport: BaZiAIReport | null
  includeAI: boolean
  detailed: boolean
  createdAt: number
  version: string
}

export interface BaZiAIReport {
  personality: string
  career: string
  wealth: string
  relationship: string
  health: string
  family: string
  luck: string
  suggestions: string[]
}

export type {
  BirthInfo,
  BaZiChart,
  XiYongShen,
}
