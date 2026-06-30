/**
 * Room Engine - 房间引擎类型定义
 * 
 * 每个房间独立评分，最后统一汇总。
 */

import type { Direction, FiveElement } from '../types'

// ============ 基础类型 ============

export type RoomType = 
  | 'entrance'     // 玄关/入户
  | 'living'       // 客厅
  | 'bedroom'      // 卧室
  | 'master-bedroom' // 主卧
  | 'kitchen'      // 厨房
  | 'bathroom'     // 卫生间
  | 'study'        // 书房
  | 'dining'       // 餐厅
  | 'balcony'      // 阳台

// ============ 房间评分结果 ============

export interface RoomAnalysisResult {
  /** 房间ID */
  roomId: string
  /** 房间类型 */
  roomType: RoomType
  /** 房间名称 */
  roomName: string
  /** 综合评分 */
  overallScore: number
  /** 各维度评分 */
  dimensionScores: RoomDimensionScores
  /** 优点列表 */
  strengths: string[]
  /** 问题列表 */
  issues: RoomIssue[]
  /** 改善建议 */
  suggestions: string[]
  /** 涉及的规则 */
  relevantRules: string[]
  /** 置信度 */
  confidence: number
  /** 五行属性 */
  element: FiveElement
  /** 朝向 */
  direction: Direction
}

export interface RoomDimensionScores {
  /** 采光 */
  lighting: number
  /** 通风 */
  ventilation: number
  /** 空间感 */
  space: number
  /** 布局合理性 */
  layout: number
  /** 风水吉凶 */
  fengShui: number
}

export interface RoomIssue {
  type: RoomIssueType
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  suggestion: string
  /** 对应的知识库 referenceId */
  referenceId?: string
  /** 对应的案例ID */
  caseId?: string
}

export type RoomIssueType = 
  | 'lighting'          // 采光问题
  | 'ventilation'       // 通风问题
  | 'space'             // 空间问题
  | 'layout'            // 布局问题
  | 'sha-qi'            // 煞气
  | 'element-imbalance' // 五行失衡
  | 'position'          // 位置问题

// ============ 房间引擎输入 ============

export interface RoomEngineInput {
  roomId: string
  roomType: RoomType
  roomName?: string
  /** 房间空间信息 */
  spatial: {
    area: number
    width: number
    depth: number
    shape: 'square' | 'rectangle' | 'irregular'
    direction: Direction
    position: Direction
    hasWindow: boolean
    hasBalcony: boolean
    windowCount: number
    doorCount: number
  }
  /** 家具列表 */
  furniture: RoomFurnitureItem[]
  /** 门列表 */
  doors: RoomDoorItem[]
  /** 窗列表 */
  windows: RoomWindowItem[]
  /** 梁/柱 */
  structural: StructuralItem[]
  /** 与其他房间的关系 */
  relations: RoomRelation[]
}

export interface RoomFurnitureItem {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  direction: Direction
  size: 'small' | 'medium' | 'large'
  material?: FiveElement
}

export interface RoomDoorItem {
  id: string
  type: 'main' | 'secondary' | 'closet'
  position: { x: number; y: number }
  direction: Direction
  width: number
  leadsTo?: string // 通往哪个房间
}

export interface RoomWindowItem {
  id: string
  type: 'normal' | 'french' | 'bay'
  position: { x: number; y: number }
  direction: Direction
  width: number
  height: number
}

export interface StructuralItem {
  id: string
  type: 'beam' | 'column'
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export interface RoomRelation {
  targetRoomId: string
  targetRoomType: RoomType
  relationType: 'adjacent' | 'opposite' | 'next-to' | 'above' | 'below'
  distance: number
  hasDirectConnection: boolean
}

// ============ 房间引擎汇总结果 ============

export interface HouseRoomAnalysisResult {
  /** 所有房间结果 */
  rooms: RoomAnalysisResult[]
  /** 综合评分 */
  overallScore: number
  /** 各维度汇总 */
  dimensionSummary: {
    lighting: number
    ventilation: number
    layout: number
    fengShui: number
  }
  /** 主要优点 */
  mainStrengths: string[]
  /** 主要问题 */
  mainIssues: RoomIssue[]
  /** 优先级建议 */
  prioritySuggestions: {
    urgent: string[]    // 紧急
    important: string[] // 重要
    minor: string[]     // 次要
  }
  /** 房间评分排名 */
  roomRanking: { roomId: string; roomName: string; score: number }[]
}
