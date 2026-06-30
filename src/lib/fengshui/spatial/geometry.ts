/**
 * Spatial Engine - 空间计算工具
 * 
 * 所有空间几何计算的底层工具
 */

import type {
  Point2D,
  BoundingBox,
  Polygon,
  Direction,
} from './types'

// ============ 距离计算 ============

/**
 * 计算两点之间的欧氏距离
 */
export function distance(p1: Point2D, p2: Point2D): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * 计算曼哈顿距离
 */
export function manhattanDistance(p1: Point2D, p2: Point2D): number {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y)
}

/**
 * 计算点到线段的距离
 */
export function pointToLineDistance(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): number {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  return distance(point, { x: xx, y: yy })
}

// ============ 碰撞/重叠检测 ============

/**
 * 检测两个边界框是否重叠
 */
export function isBoxOverlapping(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  )
}

/**
 * 计算两个边界框的重叠面积
 */
export function overlapArea(box1: BoundingBox, box2: BoundingBox): number {
  const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x))
  const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y))
  return overlapX * overlapY
}

/**
 * 计算重叠比例（相对于box1）
 */
export function overlapRatio(box1: BoundingBox, box2: BoundingBox): number {
  const area1 = box1.width * box1.height
  if (area1 === 0) return 0
  return overlapArea(box1, box2) / area1
}

/**
 * 检测点是否在边界框内
 */
export function isPointInBox(point: Point2D, box: BoundingBox): boolean {
  return point.x >= box.x && 
         point.x <= box.x + box.width &&
         point.y >= box.y && 
         point.y <= box.y + box.height
}

/**
 * 检测点是否在多边形内（射线法）
 */
export function isPointInPolygon(point: Point2D, polygon: Polygon): boolean {
  let inside = false
  const n = polygon.points.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon.points[i].x, yi = polygon.points[i].y
    const xj = polygon.points[j].x, yj = polygon.points[j].y

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}

// ============ 方向与角度 ============

/**
 * 计算两点之间的角度（度）
 */
export function angleBetween(p1: Point2D, p2: Point2D): number {
  const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  let deg = rad * (180 / Math.PI)
  if (deg < 0) deg += 360
  return deg
}

/**
 * 判断两个方向是否正对（角度差在30度以内）
 */
export function isDirectFacing(dir1: Direction, dir2: Direction): boolean {
  const oppositePairs: Record<string, string> = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'northeast': 'southwest',
    'southwest': 'northeast',
    'northwest': 'southeast',
    'southeast': 'northwest',
  }
  return oppositePairs[dir1] === dir2 || oppositePairs[dir2] === dir1
}

/**
 * 根据两点位置确定相对方向
 */
export function getRelativeDirection(from: Point2D, to: Point2D): Direction {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx < absDy * 0.4 && absDy < absDx * 0.4) {
    return 'center' as Direction
  }

  if (absDy > absDx * 2) {
    return dy < 0 ? 'north' : 'south'
  }

  if (absDx > absDy * 2) {
    return dx > 0 ? 'east' : 'west'
  }

  if (dy < 0 && dx > 0) return 'northeast'
  if (dy < 0 && dx < 0) return 'northwest'
  if (dy > 0 && dx > 0) return 'southeast'
  if (dy > 0 && dx < 0) return 'southwest'

  return 'center' as Direction
}

/**
 * 判断三个点是否共线（穿堂判断）
 */
export function isCollinear(p1: Point2D, p2: Point2D, p3: Point2D, tolerance = 0.1): boolean {
  const area = Math.abs(
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
  )
  const dist = distance(p1, p3)
  return dist > 0 ? (area / dist) < tolerance : true
}

// ============ 多边形计算 ============

/**
 * 计算多边形面积（鞋带公式）
 */
export function polygonArea(polygon: Polygon): number {
  let area = 0
  const n = polygon.points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += polygon.points[i].x * polygon.points[j].y
    area -= polygon.points[j].x * polygon.points[i].y
  }

  return Math.abs(area / 2)
}

/**
 * 计算多边形中心点（质心）
 */
export function polygonCentroid(polygon: Polygon): Point2D {
  let cx = 0
  let cy = 0
  let area = 0
  const n = polygon.points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const cross = polygon.points[i].x * polygon.points[j].y - 
                  polygon.points[j].x * polygon.points[i].y
    area += cross
    cx += (polygon.points[i].x + polygon.points[j].x) * cross
    cy += (polygon.points[i].y + polygon.points[j].y) * cross
  }

  area /= 2
  cx /= (6 * area)
  cy /= (6 * area)

  return { x: cx, y: cy }
}

/**
 * 计算多边形的边界框
 */
export function polygonBoundingBox(polygon: Polygon): BoundingBox {
  const xs = polygon.points.map(p => p.x)
  const ys = polygon.points.map(p => p.y)

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

/**
 * 判断多边形是否为矩形
 */
export function isRectangle(polygon: Polygon, tolerance = 0.1): boolean {
  if (polygon.points.length !== 4) return false

  const box = polygonBoundingBox(polygon)
  const boxArea = box.width * box.height
  const polyArea = polygonArea(polygon)

  return Math.abs(1 - polyArea / boxArea) < tolerance
}

/**
 * 判断多边形是否为正方形
 */
export function isSquare(polygon: Polygon, tolerance = 0.1): boolean {
  if (!isRectangle(polygon, tolerance)) return false

  const box = polygonBoundingBox(polygon)
  return Math.abs(1 - box.width / box.height) < tolerance
}

// ============ 缺角检测 ============

/**
 * 检测多边形的缺角
 * 
 * 原理：计算最小外接矩形，比较实际多边形与矩形的差异
 */
export function detectMissingCorners(polygon: Polygon): {
  direction: Direction
  areaRatio: number
  boundingBox: BoundingBox
  severity: 'mild' | 'moderate' | 'severe'
}[] {
  const result: {
    direction: Direction
    areaRatio: number
    boundingBox: BoundingBox
    severity: 'mild' | 'moderate' | 'severe'
  }[] = []

  const box = polygonBoundingBox(polygon)
  const boxArea = box.width * box.height
  const polyArea = polygonArea(polygon)
  const missingArea = boxArea - polyArea

  if (missingArea / boxArea < 0.02) return result // 缺失小于2%不算缺角

  // 将外接矩形分成4个角，检查每个角是否有缺失
  const cornerSize = Math.min(box.width, box.height) * 0.3

  const corners: { direction: Direction; cornerBox: BoundingBox }[] = [
    { direction: 'northwest', cornerBox: { x: box.x, y: box.y, width: cornerSize, height: cornerSize } },
    { direction: 'northeast', cornerBox: { x: box.x + box.width - cornerSize, y: box.y, width: cornerSize, height: cornerSize } },
    { direction: 'southwest', cornerBox: { x: box.x, y: box.y + box.height - cornerSize, width: cornerSize, height: cornerSize } },
    { direction: 'southeast', cornerBox: { x: box.x + box.width - cornerSize, y: box.y + box.height - cornerSize, width: cornerSize, height: cornerSize } },
  ]

  for (const { direction, cornerBox } of corners) {
    const cornerArea = cornerBox.width * cornerBox.height
    const missingInCorner = calculateMissingInCorner(polygon, cornerBox)
    const ratio = missingInCorner / cornerArea

    if (ratio > 0.2) { // 缺失超过20%
      let severity: 'mild' | 'moderate' | 'severe' = 'mild'
      if (ratio > 0.7) severity = 'severe'
      else if (ratio > 0.4) severity = 'moderate'

      result.push({
        direction,
        areaRatio: ratio,
        boundingBox: cornerBox,
        severity,
      })
    }
  }

  return result
}

function calculateMissingInCorner(polygon: Polygon, cornerBox: BoundingBox): number {
  // 简化：用角落中心点是否在多边形内来判断
  const centerX = cornerBox.x + cornerBox.width / 2
  const centerY = cornerBox.y + cornerBox.height / 2
  const isInside = isPointInPolygon({ x: centerX, y: centerY }, polygon)

  if (!isInside) {
    return cornerBox.width * cornerBox.height * 0.8 // 假设80%缺失
  }
  return 0
}

// ============ 动线分析 ============

/**
 * 计算主要动线
 */
export function analyzeMainPath(
  entrance: Point2D,
  rooms: { position: Point2D; type: string }[]
): Point2D[] {
  if (rooms.length === 0) return [entrance]

  const path: Point2D[] = [entrance]
  const visited = new Set<number>()
  let current = entrance

  while (visited.size < rooms.length) {
    let nearestIndex = -1
    let nearestDist = Infinity

    for (let i = 0; i < rooms.length; i++) {
      if (visited.has(i)) continue
      const dist = distance(current, rooms[i].position)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIndex = i
      }
    }

    if (nearestIndex === -1) break

    visited.add(nearestIndex)
    current = rooms[nearestIndex].position
    path.push(current)
  }

  return path
}

// ============ 坐标转换 ============

/**
 * 将像素坐标转换为实际米坐标
 */
export function pixelToMeter(
  point: Point2D,
  scale: number // 1像素 = ?米
): Point2D {
  return {
    x: point.x * scale,
    y: point.y * scale,
  }
}

/**
 * 将边界框从像素转换为米
 */
export function pixelBoxToMeter(
  box: BoundingBox,
  scale: number
): BoundingBox {
  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  }
}
