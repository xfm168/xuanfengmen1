/**
 * Spatial Engine - 空间关系引擎主入口
 * 
 * 这是风水系统最重要的底层。
 * 所有 Rule 禁止自己计算距离和位置，统一由 Spatial Engine 提供。
 * 
 * 负责：
 * - 房屋基础空间属性
 * - 门窗空间关系
 * - 家具空间关系
 * - 空间煞气检测
 */

import type { SpatialAnalysisResult, FurnitureSpatial, DoorSpatial, WindowSpatial } from './types'
import {
  calculateDoorWindowRelations,
  calculateDoorDoorRelations,
  detectDoorWindowSha,
} from './doorWindowRelations'
import {
  calculateFurnitureRelations,
  calculateFurnitureRoomRelations,
  detectFurnitureSha,
} from './furnitureRelations'
import {
  polygonArea,
  polygonCentroid,
  polygonBoundingBox,
  detectMissingCorners,
  analyzeMainPath,
} from './geometry'

/**
 * 空间引擎主分析函数
 * 
 * @param input - 空间输入数据
 * @returns 完整的空间分析结果
 */
export function analyzeSpatial(input: SpatialEngineInput): SpatialAnalysisResult {
  // 1. 房屋空间结构
  const house = buildHouseSpatial(input)
  
  // 2. 门窗空间关系
  const dwRelations = calculateDoorWindowRelations(input.doors, input.windows)
  const ddRelations = calculateDoorDoorRelations(input.doors)
  
  // 3. 家具空间关系
  const furnitureRelations = calculateFurnitureRelations(input.furniture)
  const furnitureRoomRelations = calculateFurnitureRoomRelations(
    input.furniture,
    input.doors,
    input.windows,
    input.furniture.filter(f => f.roomId)
  )
  
  // 4. 空间煞气检测
  const dwSha = detectDoorWindowSha(input.doors, input.windows)
  const furnitureSha = detectFurnitureSha(
    input.furniture,
    input.doors,
    input.windows,
    input.furniture
  )
  
  // 5. 综合置信度
  const confidence = calculateConfidence(input)
  
  return {
    house,
    doors: input.doors,
    windows: input.windows,
    furniture: input.furniture,
    doorWindowRelations: dwRelations,
    doorDoorRelations: ddRelations,
    furnitureRelations,
    furnitureRoomRelations,
    spatialSha: [...dwSha, ...furnitureSha],
    confidence,
  }
}

// ============ 输入类型 ============

export interface SpatialEngineInput {
  /** 房屋轮廓点 */
  outline: { x: number; y: number }[]
  /** 朝向 */
  orientation: any // Direction
  /** 楼层信息 */
  floorInfo: {
    currentFloor: number
    totalFloors: number
    buildingType: any // HouseType
    houseAge: number
  }
  /** 所有门 */
  doors: DoorSpatial[]
  /** 所有窗 */
  windows: WindowSpatial[]
  /** 所有家具 */
  furniture: FurnitureSpatial[]
  /** 电梯位置 */
  elevatorPosition?: { x: number; y: number }
  /** 楼梯位置 */
  stairsPosition?: { x: number; y: number }
}

// ============ 房屋空间构建 ============

function buildHouseSpatial(input: SpatialEngineInput): SpatialAnalysisResult['house'] {
  const polygon = { points: input.outline }
  
  // 计算面积
  const totalArea = polygonArea(polygon)
  const usableArea = totalArea * 0.85
  
  // 计算中宫
  const centroid = polygonCentroid(polygon)
  const bbox = polygonBoundingBox(polygon)
  const centerSize = Math.min(bbox.width, bbox.height) * 0.3
  
  const centerArea = {
    x: centroid.x - centerSize / 2,
    y: centroid.y - centerSize / 2,
    width: centerSize,
    height: centerSize,
  }
  
  // 检测缺角
  const missingCorners = detectMissingCorners(polygon)
  
  // 计算坐向（与朝向相反）
  const sittingDirMap: Record<string, string> = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'northeast': 'southwest',
    'southwest': 'northeast',
    'northwest': 'southeast',
    'southeast': 'northwest',
  }
  
  // 检测形状
  const shape = detectShape(polygon, missingCorners)
  
  // 动线分析
  const mainEntrance = input.doors.find(d => d.type === 'main-entrance')
  const mainPath = mainEntrance ? analyzeMainPath(
    mainEntrance.position,
    input.furniture
      .filter(f => f.roomId)
      .map(f => ({
        position: {
          x: f.boundingBox.x + f.boundingBox.width / 2,
          y: f.boundingBox.y + f.boundingBox.height / 2,
        },
        type: f.type,
      }))
  ) : []
  
  return {
    outline: polygon,
    shape,
    totalArea,
    usableArea,
    orientation: input.orientation,
    sittingDirection: (sittingDirMap[input.orientation] || 'north') as any,
    centerPoint: centroid,
    centerArea,
    missingCorners: missingCorners.map(mc => ({
      ...mc,
      description: `${mc.direction}角${mc.severity === 'severe' ? '严重' : mc.severity === 'moderate' ? '中度' : '轻度'}缺失`,
    })),
    protrudingCorners: [],
    floorInfo: input.floorInfo,
    elevatorPosition: input.elevatorPosition,
    stairsPosition: input.stairsPosition,
    circulation: {
      mainEntrance: mainEntrance?.position || { x: 0, y: 0 },
      mainPath,
      deadEnds: [],
      mainTrafficFlow: [],
      trafficCongestionZones: [],
    },
  }
}

function detectShape(polygon: { points: { x: number; y: number }[] }, missingCorners: any[]): any {
  if (missingCorners.length === 0) {
    const bbox = polygonBoundingBox(polygon)
    const ratio = Math.abs(bbox.width - bbox.height) / Math.max(bbox.width, bbox.height)
    return ratio < 0.1 ? 'square' : 'rectangle'
  }
  
  if (missingCorners.length >= 2) {
    return 'L-shape'
  }
  
  if (missingCorners.length >= 3) {
    return 'irregular'
  }
  
  return 'rectangle'
}

// ============ 置信度计算 ============

function calculateConfidence(input: SpatialEngineInput): number {
  let score = 50 // 基础分
  
  // 门窗数量加分
  if (input.doors.length > 0) score += 10
  if (input.windows.length > 0) score += 10
  
  // 家具数量加分
  if (input.furniture.length > 5) score += 10
  else if (input.furniture.length > 0) score += 5
  
  // 轮廓清晰度加分
  if (input.outline.length > 4) score += 10
  
  return Math.min(99, score)
}

// ============ 便捷查询函数 ============

/**
 * 获取指定家具的空间关系
 */
export function getFurnitureSpatialRelations(
  result: SpatialAnalysisResult,
  furnitureId: string
) {
  const furniture = result.furniture.find(f => f.id === furnitureId)
  const roomRel = result.furnitureRoomRelations.find(r => r.furnitureId === furnitureId)
  const rels = result.furnitureRelations.filter(
    r => r.furnitureAId === furnitureId || r.furnitureBId === furnitureId
  )
  
  return {
    furniture,
    roomRelations: roomRel,
    furnitureRelations: rels,
  }
}

/**
 * 获取指定房间的所有家具
 */
export function getRoomFurniture(
  result: SpatialAnalysisResult,
  roomId: string
): FurnitureSpatial[] {
  return result.furniture.filter(f => f.roomId === roomId)
}

/**
 * 检测指定家具是否压梁
 */
export function isFurnitureUnderBeam(
  result: SpatialAnalysisResult,
  furnitureId: string
): boolean {
  const rel = result.furnitureRoomRelations.find(r => r.furnitureId === furnitureId)
  return rel?.isUnderBeam || false
}

/**
 * 获取两个家具之间的距离
 */
export function getDistanceBetweenFurniture(
  result: SpatialAnalysisResult,
  furnitureAId: string,
  furnitureBId: string
): number | null {
  const rel = result.furnitureRelations.find(
    r => (r.furnitureAId === furnitureAId && r.furnitureBId === furnitureBId) ||
         (r.furnitureAId === furnitureBId && r.furnitureBId === furnitureAId)
  )
  return rel?.distance ?? null
}
