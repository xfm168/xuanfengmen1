import type { AIPrompt, AIPromptKey } from '../types'
import { divinationPrompts } from './divination'
import { fengshuiPrompts } from './fengshui'
import { dailyPrompts } from './daily'
import { baziPrompts } from './bazi'

export const allPrompts: Record<AIPromptKey, AIPrompt> = {
  ...divinationPrompts,
  ...fengshuiPrompts,
  ...dailyPrompts,
  ...baziPrompts,
} as Record<AIPromptKey, AIPrompt>

export function getPrompt(key: AIPromptKey): AIPrompt {
  const prompt = allPrompts[key]
  if (!prompt) {
    throw new Error(`Prompt "${key}" not found`)
  }
  return prompt
}

export function renderPrompt(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): string {
  return template.replace(/\{\{\s*#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g, (_, key, content) => {
    return variables[key] ? content : ''
  }).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const value = variables[key]
    return value !== undefined ? String(value) : ''
  })
}

export * from './divination'
export * from './fengshui'
export * from './daily'
export * from './bazi'
