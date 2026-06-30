/**
 * 客厅分析器 (Living Room Engine)
 * 
 * 负责：
 * - 纳气
 * - 财气
 * - 明堂
 * - 聚气
 * - 沙发布局
 */

import type { RoomEngineInput, RoomAnalysisResult, RoomIssue } from '../types'

export function analyzeLivingRoom(input: RoomEngineInput): RoomAnalysisResult {
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
    lightingScore * 0.15 +
    ventilationScore * 0.15 +
    spaceScore * 0.2 +
    layoutScore * 0.25 +
    fengShuiScore * 0.25
  )
  
  return {
    roomId: input.roomId,
    roomType: input.roomType,
    roomName: input.roomName || '客厅',
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
    confidence: 82,
    element: '火',
    direction: input.spatial.direction,
  }
}

function calculateLightingScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 50
  
  if (input.spatial.hasWindow) {
    score += 25
  }
  
  if (input.spatial.hasBalcony) {
    score += 20
    strengths.push('客厅有阳台，采光充足')
  }
  
  if (input.spatial.windowCount >= 2) {
    score += 5
  }
  
  if (score < 70) {
    issues.push({
      type: 'lighting',
      severity: 'mild',
      description: '客厅采光不足，气场偏阴',
      suggestion: '增加照明，使用明亮色调',
    })
  }
  
  return Math.min(100, score)
}

function calculateVentilationScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 55
  
  if (input.spatial.hasWindow) {
    score += 20
  }
  
  if (input.spatial.hasBalcony) {
    score += 20
    strengths.push('客厅通风良好，气流畅通')
  }
  
  // 穿堂煞（通风过度）
  const hasDoor = input.doors.some(d => d.type === 'main')
  if (hasDoor && input.spatial.hasBalcony) {
    score -= 10
    issues.push({
      type: 'sha-qi',
      severity: 'moderate',
      description: '客厅直通阳台，形成穿堂煞，财运难聚',
      suggestion: '设置屏风或玄关柜遮挡',
      caseId: 'case-chuan-tang-sha',
    })
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateSpaceScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[]): number {
  let score = 60
  const area = input.spatial.area
  
  if (area >= 25) {
    score += 20
    strengths.push('客厅宽敞明亮，气场充足')
  } else if (area >= 15) {
    score += 10
  } else {
    issues.push({
      type: 'space',
      severity: 'moderate',
      description: '客厅面积偏小，明堂不开阔',
      suggestion: '减少家具，保持空间通透',
    })
  }
  
  if (input.spatial.shape === 'square' || input.spatial.shape === 'rectangle') {
    score += 10
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateLayoutScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[], suggestions: string[]): number {
  let score = 70
  
  const sofa = input.furniture.find(f => f.type === 'sofa')
  const tv = input.furniture.find(f => f.type === 'tv')
  
  // 沙发要有靠山
  if (sofa) {
    const isAgainstWall = sofa.position.x < 0.5 || sofa.position.x > 9.5 ||
                          sofa.position.y < 0.5 || sofa.position.y > 9.5
    if (isAgainstWall) {
      score += 10
      strengths.push('沙发靠墙摆放，有靠山')
    } else {
      score -= 10
      issues.push({
        type: 'layout',
        severity: 'mild',
        description: '沙发背后无靠，运势不稳',
        suggestion: '沙发靠墙摆放，或用矮柜做靠山',
      })
    }
  }
  
  // 电视墙与沙发相对
  if (sofa && tv) {
    score += 10
    strengths.push('沙发布局合理，视听舒适')
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateFengShuiScore(input: RoomEngineInput, issues: RoomIssue[], strengths: string[], suggestions: string[]): number {
  let score = 70
  
  // 财位
  const mainDoor = input.doors.find(d => d.type === 'main')
  if (mainDoor) {
    // 斜对角为财位
    score += 10
    strengths.push('财位位置明确')
  }
  
  // 客厅在房屋中心好
  if (input.spatial.position === 'center' as any) {
    score += 10
    strengths.push('客厅位于房屋中心，聚气效果好')
  }
  
  // 有鱼缸（聚财）
  const fishTank = input.furniture.find(f => f.type === 'fish-tank')
  if (fishTank) {
    score += 5
    strengths.push('客厅有鱼缸，有助财运')
  }
  
  // 有植物（生气）
  const plants = input.furniture.filter(f => f.type === 'plant')
  if (plants.length > 0) {
    score += 5
    strengths.push('客厅有绿植，增添生气')
  }
  
  return Math.max(0, Math.min(100, score))
}
