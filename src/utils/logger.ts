/**
 * Unified Logger for XuanFeng FengShui Application
 * 
 * All logging should go through this module.
 * Direct console calls are prohibited in production code.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: unknown
}

/** Whether running in development mode */
const IS_DEV = import.meta.env?.DEV ?? false

/** Log context prefix for module identification */
const APP_PREFIX = '[玄风]'

/**
 * Format log entry for output
 */
function formatEntry(entry: LogEntry): string {
  const ts = entry.timestamp
  const ctx = entry.context ? `[${entry.context}]` : ''
  return `${ts} ${APP_PREFIX}${ctx} ${entry.message}`
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
  }

  const formatted = formatEntry(entry)

  // Development: output all levels
  // Production: only warn and error (debug and info are suppressed)
  if (!IS_DEV) {
    if (level !== 'warn' && level !== 'error') {
      return
    }
  }

  switch (level) {
    case 'error':
      console.error(formatted, data ?? '')
      break
    case 'warn':
      console.warn(formatted, data ?? '')
      break
    case 'info':
      console.info(formatted, data ?? '')
      break
    case 'debug':
      console.debug(formatted, data ?? '')
      break
  }
}

/**
 * Unified Logger API
 * 
 * Environment behavior:
 * - Development: all levels (debug, info, warn, error)
 * - Production: warn and error only
 */
export const logger = {
  /**
   * Log error (always visible)
   */
  error(message: string, context?: string, data?: unknown): void {
    log('error', message, context, data)
  },

  /**
   * Log warning (visible in dev and prod)
   */
  warn(message: string, context?: string, data?: unknown): void {
    log('warn', message, context, data)
  },

  /**
   * Log info (visible in dev, suppressed in prod)
   */
  info(message: string, context?: string, data?: unknown): void {
    log('info', message, context, data)
  },

  /**
   * Log debug (only visible in dev mode)
   */
  debug(message: string, context?: string, data?: unknown): void {
    log('debug', message, context, data)
  },

  /**
   * Create a scoped logger for a specific module
   * Alias for child()
   */
  scope(context: string) {
    return this.child(context)
  },

  /**
   * Create a child logger with fixed context
   * 
   * Reserved for:
   * - Pipeline Logger
   * - AI Logger
   * - Rule Logger
   * - Knowledge Logger
   * 
   * @example
   * const pipelineLogger = logger.child('Pipeline')
   * pipelineLogger.info('Step completed')
   * // Output: [Pipeline] Step completed
   */
  child(context: string) {
    return {
      error: (message: string, data?: unknown) => log('error', message, context, data),
      warn: (message: string, data?: unknown) => log('warn', message, context, data),
      info: (message: string, data?: unknown) => log('info', message, context, data),
      debug: (message: string, data?: unknown) => log('debug', message, context, data),
    }
  },
}

export default logger