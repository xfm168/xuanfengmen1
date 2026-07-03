/**
 * 统一 Result<T> 类型
 * 所有模块（Calculator / Analyzer / Pipeline / AI / Database）统一返回格式
 */

export interface Result<T> {
  success: boolean
  data: T | null
  error: ErrorInfo | null
  warnings: WarningInfo[]
  version: string
  /** 耗时（毫秒） */
  duration: number
  /** 时间戳 */
  timestamp: number
}

export interface ErrorInfo {
  code: string
  message: string
  stack?: string
}

export interface WarningInfo {
  code: string
  message: string
  level: 'low' | 'medium' | 'high'
}

// ─── 工厂函数 ───

export function ok<T>(data: T, duration: number = 0): Result<T> {
  return {
    success: true,
    data,
    error: null,
    warnings: [],
    version: '2.0.0',
    duration,
    timestamp: Date.now(),
  }
}

export function fail<T>(
  code: string,
  message: string,
  duration: number = 0,
): Result<T> {
  return {
    success: false,
    data: null,
    error: { code, message },
    warnings: [],
    version: '2.0.0',
    duration,
    timestamp: Date.now(),
  }
}

export function warn<T>(
  data: T,
  warning: WarningInfo,
  duration: number = 0,
): Result<T> {
  return {
    success: true,
    data,
    error: null,
    warnings: [warning],
    version: '2.0.0',
    duration,
    timestamp: Date.now(),
  }
}
