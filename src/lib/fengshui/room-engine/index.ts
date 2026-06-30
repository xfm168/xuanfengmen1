/**
 * Room Engine - 房间引擎主入口
 * 
 * 每一个房间独立评分，最后统一汇总。
 * 
 * 支持的房间类型：
 * - 卧室 (Bedroom)
 * - 客厅 (Living Room)
 * - 厨房 (Kitchen)
 * - 卫生间 (Bathroom)
 * - 书房 (Study)
 * - 餐厅 (Dining)
 * - 阳台 (Balcony)
 * - 玄关 (Entrance)
 */

import type { RoomEngineInput, RoomAnalysisResult, HouseRoomAnalysisResult } from './types'
import { analyzeBedroom } from './rooms/bedroom'
import { analyzeKitchen } from './rooms/kitchen'
import { analyzeLivingRoom } from './rooms/livingRoom'
import { analyzeBathroom } from './rooms/bathroom'

/**
 * 分析单个房间
 */
export function analyzeRoom(input: RoomEngineInput): RoomAnalysisResult {
  switch (input.roomType) {
    case 'bedroom':
    case 'master-bedroom':
      return analyzeBedroom(input)
    case 'kitchen':
      return analyzeKitchen(input)
    case 'living':
      return analyzeLivingRoom(input)
    case 'bathroom':
      return analyzeBathroom(input)
    default:
      return analyzeGenericRoom(input)
  }
}

/**
 * 通用房间分析（未实现特殊逻辑的房间）
 */
function analyzeGenericRoom(input: RoomEngineInput): RoomAnalysisResult {
  return {
    roomId: input.roomId,
    roomType: input.roomType,
    roomName: input.roomName || input.roomType,
    overallScore: 70,
    dimensionScores: {
      lighting: input.spatial.hasWindow ? 80 : 50,
      ventilation: input.spatial.hasWindow ? 75 : 50,
      space: 70,
      layout: 70,
      fengShui: 70,
    },
    strengths: [],
    issues: [],
    suggestions: [],
    relevantRules: [],
    confidence: 60,
    element: '土',
    direction: input.spatial.direction,
  }
}

/**
 * 分析整套房子所有房间
 */
export function analyzeHouseRooms(inputs: RoomEngineInput[]): HouseRoomAnalysisResult {
  const rooms = inputs.map(input => analyzeRoom(input))
  
  // 计算各维度汇总
  const lightingAvg = average(rooms.map(r => r.dimensionScores.lighting))
  const ventilationAvg = average(rooms.map(r => r.dimensionScores.ventilation))
  const layoutAvg = average(rooms.map(r => r.dimensionScores.layout))
  const fengShuiAvg = average(rooms.map(r => r.dimensionScores.fengShui))
  
  const overallScore = Math.round(
    lightingAvg * 0.15 +
    ventilationAvg * 0.15 +
    layoutAvg * 0.25 +
    fengShuiAvg * 0.45
  )
  
  // 收集所有问题
  const allIssues = rooms.flatMap(r => r.issues)
  
  // 按优先级分类
  const urgent = allIssues
    .filter(i => i.severity === 'severe')
    .map(i => i.suggestion)
  
  const important = allIssues
    .filter(i => i.severity === 'moderate')
    .map(i => i.suggestion)
  
  const minor = allIssues
    .filter(i => i.severity === 'mild')
    .map(i => i.suggestion)
  
  // 主要优点
  const allStrengths = [...new Set(rooms.flatMap(r => r.strengths))]
  
  // 房间排名
  const roomRanking = [...rooms]
    .sort((a, b) => b.overallScore - a.overallScore)
    .map(r => ({
      roomId: r.roomId,
      roomName: r.roomName,
      score: r.overallScore,
    }))
  
  return {
    rooms,
    overallScore,
    dimensionSummary: {
      lighting: Math.round(lightingAvg),
      ventilation: Math.round(ventilationAvg),
      layout: Math.round(layoutAvg),
      fengShui: Math.round(fengShuiAvg),
    },
    mainStrengths: allStrengths.slice(0, 10),
    mainIssues: allIssues.filter(i => i.severity !== 'mild'),
    prioritySuggestions: {
      urgent: [...new Set(urgent)],
      important: [...new Set(important)],
      minor: [...new Set(minor)],
    },
    roomRanking,
  }
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((sum, val) => sum + val, 0) / arr.length
}

export {
  analyzeBedroom,
  analyzeKitchen,
  analyzeLivingRoom,
  analyzeBathroom,
}
