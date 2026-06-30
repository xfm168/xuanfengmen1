/**
 * 卫生间分析器 (Bathroom Engine)
 * 
 * 负责：
 * - 排污
 * - 湿气
 * - 中宫
 * - 水气
 */

import type { RoomEngineInput, RoomAnalysisResult, RoomIssue } from '../types'

export function analyzeBathroom(input: RoomEngineInput): RoomAnalysisResult {
  const issues: RoomIssue[] = []
  const strengths: string[] = []
  const suggestions: string[] = []
  
  let lightingScore = 50
  let ventilationScore = 50
  let spaceScore = 60
  let layoutScore = 70
  let fengShuiScore = 60
  
  // 通风
  if (input.spatial.hasWindow) {
    ventilationScore += 30
    strengths.push('卫生间有窗户，通风良好')
  } else {
    issues.push({
      type: 'ventilation',
      severity: 'moderate',
      description: '卫生间无窗户，湿气重',
      suggestion: '安装排气扇，使用除湿机',
    })
  }
  
  // 位置
  if (input.spatial.position === 'center') {
    fengShuiScore -= 30
    issues.push({
      type: 'position',
      severity: 'severe',
      description: '厕压中宫，污秽之气影响全宅',
      suggestion: '保持清洁，安装强力排气扇，摆放绿植净化',
      caseId: 'case-ce-ya-zhong-gong',
    })
  }
  
  // 面积
  if (input.spatial.area >= 5) {
    spaceScore += 15
  }
  
  const overallScore = Math.round(
    lightingScore * 0.1 +
    ventilationScore * 0.3 +
    spaceScore * 0.15 +
    layoutScore * 0.15 +
    fengShuiScore * 0.3
  )
  
  return {
    roomId: input.roomId,
    roomType: input.roomType,
    roomName: input.roomName || '卫生间',
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
    confidence: 75,
    element: '水',
    direction: input.spatial.direction,
  }
}
