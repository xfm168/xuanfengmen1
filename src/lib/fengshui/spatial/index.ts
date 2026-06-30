/**
 * Spatial Engine - 空间关系引擎
 * 
 * 这是风水系统最重要的底层。
 * 所有 Rule 禁止自己计算距离和位置，统一由 Spatial Engine 提供。
 * 
 * @example
 * import { analyzeSpatial, getFurnitureSpatialRelations } from '@/lib/fengshui/spatial'
 * 
 * const result = analyzeSpatial({
 *   outline: [...],
 *   doors: [...],
 *   windows: [...],
 *   furniture: [...],
 * })
 * 
 * // 穿堂煞检测
 * const chuanTang = result.spatialSha.filter(s => s.type === 'chuan-tang-sha')
 * 
 * // 查询床的空间关系
 * const bedRel = getFurnitureSpatialRelations(result, 'bed-1')
 * console.log(bedRel.roomRelations.isUnderBeam)  // 是否压梁
 * console.log(bedRel.roomRelations.isFacingDoor) // 是否冲门
 */

export * from './types'
export * from './geometry'
export * from './engine'
export * from './doorWindowRelations'
export * from './furnitureRelations'
