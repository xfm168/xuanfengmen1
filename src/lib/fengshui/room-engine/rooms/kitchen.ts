/**
 * 厨房分析器 (Kitchen Engine)
 * 
 * 负责：
 * - 灶位
 * - 水火关系
 * - 财库
 * - 饮食
 * - 女主人运
 */

import type { RoomEngineInput, RoomAnalysisResult, RoomIssue } from '../types'

export function analyzeKitchen(input: RoomEngineInput): RoomAnalysisResult {
  const issues: RoomIssue[] = []
  const strengths: string[] = []
  const suggestions: string[] = []
  
  // 1. 采光分析
  const lightingScore = calculateLightingScore(input, issues, strengths)
  
  // 2. 通风分析
  const ventilationScore = calculateVentilationScore(input, issues, strengths)
  
  // 3. 空间分析
  const spaceScore = calculateSpaceScore(input, issues, strengths)
  
  // 4. 布局分析
  const layoutScore = calculateLayoutScore(input, issues, strengths, suggestions)
  
  // 5. 风水吉凶
  const fengShuiScore = calculateFengShuiScore(input, issues, strengths, suggestions)
  
  // 综合评分
  const overallScore = Math.round(
    lightingScore * 0.1 +
    ventilationScore * 0.2 +
    spaceScore * 0.15 +
    layoutScore * 0.25 +
    fengShuiScore * 0.3
  )
  
  return {
    roomId: input.roomId,
    roomType: input.roomType,
    roomName: input.roomName || '厨房',
    overallScore,
    dimensionScores: {
      lighting: lightingScore,
      ventilation: ventilationScore,
      space: spaceScore,
      layout: layoutScore,
      fengShui: fengShuiScore,
    },
    strengths,
    issues,
    suggestions,
    relevantRules: [],
    confidence: 78,
    element: '火',
    direction: input.spatial.direction,
  }
}

function calculateLightingScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 50
  
  if (input.spatial.hasWindow) {
    score += 30
    strengths.push('厨房有窗户，采光充足')
  } else {
    issues.push({
      type: 'lighting',
      severity: 'moderate',
      description: '厨房无窗户，采光不足',
      suggestion: '增加照明设备，使用明亮色调',
    })
  }
  
  return Math.min(100, score)
}

function calculateVentilationScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 50
  
  if (input.spatial.hasWindow) {
    score += 35
    strengths.push('厨房通风良好，油烟易排出')
  } else {
    score += 15
    issues.push({
      type: 'ventilation',
      severity: 'severe',
      description: '厨房通风不佳，油烟积聚',
      suggestion: '安装大功率抽油烟机，保持空气流通',
    })
  }
  
  return Math.min(100, score)
}

function calculateSpaceScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 60
  const area = input.spatial.area
  
  if (area >= 8) {
    score += 20
    strengths.push('厨房空间宽敞，操作便利')
  } else if (area >= 5) {
    score += 10
  } else {
    issues.push({
      type: 'space',
      severity: 'moderate',
      description: '厨房空间偏小，操作不便',
      suggestion: '合理规划收纳，使用多功能厨具',
    })
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateLayoutScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[], suggestions: string[]): number {
  let score = 70
  
  const stove = input.furniture.find(f => f.type === 'stove')
  const sink = input.furniture.find(f => f.type === 'sink')
  const fridge = input.furniture.find(f => f.type === 'refrigerator')
  
  // 水火相对
  if (stove && sink) {
    const dist = Math.sqrt(
      Math.pow(stove.position.x - sink.position.x, 2) + 
      Math.pow(stove.position.y - sink.position.y, 2)
    )
    if (dist < 0.5) {
      score -= 20
      issues.push({
        type: 'sha-qi',
        severity: 'moderate',
        description: '灶台与水槽距离太近，水火相冲',
        suggestion: '增加操作台作为缓冲',
        referenceId: '',
      })
    } else if (dist >= 1 && dist <= 3) {
      score += 10
      strengths.push('灶台与水槽位置适中，操作方便')
    }
  }
  
  // 冰箱靠近灶台
  if (stove && fridge) {
    const dist = Math.sqrt(
      Math.pow(stove.position.x - fridge.position.x, 2) + 
      Math.pow(stove.position.y - fridge.position.y, 2)
    )
    if (dist < 0.5) {
      score -= 10
      issues.push({
        type: 'element-imbalance',
        severity: 'mild',
        description: '冰箱与灶台距离太近，冷热相冲',
        suggestion: '调整冰箱位置',
      })
    }
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateFengShuiScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[], suggestions: string[]): number {
  let score = 65
  
  // 开门见灶
  const mainDoor = input.doors.find(d => d.type === 'main')
  const stove = input.furniture.find(f => f.type === 'stove')
  
  if (mainDoor && stove) {
    const dist = Math.sqrt(
      Math.pow(stove.position.x - mainDoor.position.x, 2) + 
      Math.pow(stove.position.y - mainDoor.position.y, 2)
    )
    if (dist < 2) {
      score -= 20
      issues.push({
        type: 'sha-qi',
        severity: 'moderate',
        description: '开门见灶，钱财多耗',
        suggestion: '设置屏风或玄关遮挡',
        caseId: 'case-kai-men-jian-zao',
      })
    }
  }
  
  // 厨房位置
  if (input.spatial.position === 'east' || input.spatial.position === 'southeast') {
    score += 10
    strengths.push('厨房位于东方/东南方，木火相生')
  } else if (input.spatial.position === 'north') {
    score -= 10
    issues.push({
      type: 'position',
      severity: 'mild',
      description: '厨房位于北方，水火相克',
      suggestion: '用绿植调和',
    })
  }
  
  // 灶位朝向
  if (stove?.direction === 'east' || stove?.direction === 'southeast') {
    score += 10
    strengths.push('灶台朝东，木火相生，主旺财运')
  }
  
  return Math.max(0, Math.min(100, score))
}
