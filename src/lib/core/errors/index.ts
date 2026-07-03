/**
 * 统一 Domain Error 定义
 * 所有模块共用错误码和错误工厂
 */

export type DomainErrorCode =
  // 排盘
  | 'BZ-001' // 排盘失败（参数错误）
  | 'BZ-002' // 节气数据不存在
  | 'BZ-003' // 命例校验失败
  // 规则
  | 'BZ-004' // Rule 不存在
  | 'BZ-005' // Explain 失败
  // 配置
  | 'BZ-006' // 配置无效
  | 'BZ-007' // 规则冲突未解决
  // 数据
  | 'BZ-008' // 命例不足（低于阈值）
  | 'BZ-009' // Benchmark 一致率低于阈值
  // AI
  | 'BZ-010' // AI 调用失败（已降级）
  // 核心
  | 'CORE-001' // 类型不匹配
  | 'CORE-002' // 常量缺失
  | 'CORE-003' // 计算异常

export interface DomainError {
  code: DomainErrorCode
  message: string
  level: 'Error' | 'Warn'
  detail?: string
}

export const ERROR_CODES: Record<DomainErrorCode, Omit<DomainError, 'detail'>> = {
  'BZ-001': { code: 'BZ-001', message: '排盘失败（参数错误）', level: 'Error' },
  'BZ-002': { code: 'BZ-002', message: '节气数据不存在', level: 'Error' },
  'BZ-003': { code: 'BZ-003', message: '命例校验失败', level: 'Error' },
  'BZ-004': { code: 'BZ-004', message: 'Rule 不存在', level: 'Error' },
  'BZ-005': { code: 'BZ-005', message: 'Explain 失败', level: 'Error' },
  'BZ-006': { code: 'BZ-006', message: '配置无效', level: 'Warn' },
  'BZ-007': { code: 'BZ-007', message: '规则冲突未解决', level: 'Warn' },
  'BZ-008': { code: 'BZ-008', message: '命例不足（低于阈值）', level: 'Warn' },
  'BZ-009': { code: 'BZ-009', message: 'Benchmark 一致率低于阈值', level: 'Warn' },
  'BZ-010': { code: 'BZ-010', message: 'AI 调用失败（已降级）', level: 'Warn' },
  'CORE-001': { code: 'CORE-001', message: '类型不匹配', level: 'Error' },
  'CORE-002': { code: 'CORE-002', message: '常量缺失', level: 'Error' },
  'CORE-003': { code: 'CORE-003', message: '计算异常', level: 'Error' },
}

export function createError(code: DomainErrorCode, detail?: string): DomainError {
  const base = ERROR_CODES[code]
  return { ...base, detail }
}
