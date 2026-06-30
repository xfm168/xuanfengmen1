/**
 * Spatial Engine - 门窗空间关系计算
 * 
 * 负责：
 * - 门窗空间关系
 * - 门门空间关系
 * - 穿堂煞检测
 */

import {
  distance,
  isDirectFacing,
  isCollinear,
  isBoxOverlapping,
  getRelativeDirection,
} from './geometry'

import type {
  DoorSpatial,
  WindowSpatial,
  DoorWindowRelation,
  DoorDoorRelation,
  DoorDoorRelationType,
  SpatialShaDetection,
} from './types'

/**
 * 计算所有门窗之间的空间关系
 */
export function calculateDoorWindowRelations(
  doors: DoorSpatial[],
  windows: WindowSpatial[]
): DoorWindowRelation[] {
  const relations: DoorWindowRelation[] = []

  for (const door of doors) {
    for (const window_ of windows) {
      const relation = calculateSingleDoorWindowRelation(door, window_)
      relations.push(relation)
    }
  }

  return relations
}

/**
 * 计算单扇门与单扇窗的关系
 */
function calculateSingleDoorWindowRelation(
  door: DoorSpatial,
  window_: WindowSpatial
): DoorWindowRelation {
  const dist = distance(door.position, window_.position)
  const isFacing = isDirectFacing(door.direction, window_.direction)
  const straight = isCollinear(door.position, window_.position, {
    x: door.position.x + (door.direction === 'east' || door.direction === 'west' ? 100 : 0),
    y: door.position.y + (door.direction === 'south' || door.direction === 'north' ? 100 : 0),
  })

  return {
    doorId: door.id,
    windowId: window_.id,
    isDirectFacing: isFacing,
    isStraightThrough: isFacing && straight && dist > 1,
    distance: dist,
    angle: 0, // 简化
    hasObstruction: false, // 简化，需要遮挡物检测
  }
}

/**
 * 计算所有门之间的空间关系
 */
export function calculateDoorDoorRelations(
  doors: DoorSpatial[]
): DoorDoorRelation[] {
  const relations: DoorDoorRelation[] = []

  for (let i = 0; i < doors.length; i++) {
    for (let j = i + 1; j < doors.length; j++) {
      const relation = calculateSingleDoorDoorRelation(doors[i], doors[j])
      relations.push(relation)
    }
  }

  return relations
}

/**
 * 计算两扇门之间的关系
 */
function calculateSingleDoorDoorRelation(
  doorA: DoorSpatial,
  doorB: DoorSpatial
): DoorDoorRelation {
  const dist = distance(doorA.position, doorB.position)
  const facing = isDirectFacing(doorA.direction, doorB.direction)
  
  let relationType: DoorDoorRelationType = '无直接关系'

  if (facing && dist < 5) {
    relationType = '门冲'
  } else if (dist < 2) {
    relationType = '相邻'
  }

  return {
    doorAId: doorA.id,
    doorBId: doorB.id,
    isFacing: facing,
    distance: dist,
    relationType,
  }
}

// ============ 空间煞气检测 ============

/**
 * 检测穿堂煞
 * 
 * 条件：
 * - 大门正对阳台/窗户/后门
 * - 两者在一条直线上
 * - 中间无遮挡
 */
export function detectChuanTangSha(
  doors: DoorSpatial[],
  windows: WindowSpatial[],
  relations: DoorWindowRelation[]
): SpatialShaDetection[] {
  const results: SpatialShaDetection[] = []

  // 找大门
  const mainDoor = doors.find(d => d.type === 'main-entrance')
  if (!mainDoor) return results

  // 检查大门与阳台/落地窗/后门的关系
  for (const rel of relations) {
    if (rel.doorId !== mainDoor.id) continue

    const window_ = windows.find(w => w.id === rel.windowId)
    if (!window_) continue

    if (
      rel.isStraightThrough &&
      (window_.type === 'balcony' || window_.type === 'french-window')
    ) {
      const severity = determineChuanTangSeverity(rel.distance)
      
      results.push({
        type: 'chuan-tang-sha',
        severity,
        confidence: 85,
        description: `大门正对${window_.type === 'balcony' ? '阳台' : '落地窗'}，气流直进直出，形成穿堂煞`,
        involvedElements: [mainDoor.id, window_.id],
        spatialEvidence: {
          distance: rel.distance,
          isStraight: rel.isStraightThrough,
          hasObstruction: rel.hasObstruction,
        },
      })
    }
  }

  // 检查大门与后门的关系
  const backDoor = doors.find(d => d.type === 'back-door')
  if (backDoor) {
    const doorRelation = calculateSingleDoorDoorRelation(mainDoor, backDoor)
    if (doorRelation.relationType === '门冲') {
      results.push({
        type: 'chuan-tang-sha',
        severity: 'severe',
        confidence: 90,
        description: '大门正对后门，形成穿堂煞，财运难聚',
        involvedElements: [mainDoor.id, backDoor.id],
        spatialEvidence: {
          distance: doorRelation.distance,
          isStraight: true,
        },
      })
    }
  }

  return results
}

function determineChuanTangSeverity(distance: number): 'mild' | 'moderate' | 'severe' {
  if (distance < 3) return 'severe'
  if (distance < 6) return 'moderate'
  return 'mild'
}

/**
 * 检测门门冲
 */
export function detectDoorDoorChong(
  doorRelations: DoorDoorRelation[]
): SpatialShaDetection[] {
  const results: SpatialShaDetection[] = []

  for (const rel of doorRelations) {
    if (rel.relationType === '门冲') {
      results.push({
        type: 'men-men-chong',
        severity: rel.distance < 2 ? 'severe' : rel.distance < 4 ? 'moderate' : 'mild',
        confidence: 75,
        description: `两扇门正对，形成门冲`,
        involvedElements: [rel.doorAId, rel.doorBId],
        spatialEvidence: {
          distance: rel.distance,
          isStraight: rel.isFacing,
        },
      })
    }
  }

  return results
}

/**
 * 综合检测门窗类煞气
 */
export function detectDoorWindowSha(
  doors: DoorSpatial[],
  windows: WindowSpatial[]
): SpatialShaDetection[] {
  const dwRelations = calculateDoorWindowRelations(doors, windows)
  const ddRelations = calculateDoorDoorRelations(doors)

  const results: SpatialShaDetection[] = [
    ...detectChuanTangSha(doors, windows, dwRelations),
    ...detectDoorDoorChong(ddRelations),
  ]

  return results
}
