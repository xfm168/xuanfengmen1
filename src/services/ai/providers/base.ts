import type {
  AIMessage,
  AIRequestOptions,
  AIResponse,
  AIProvider,
  AIProviderType,
  AIModel,
} from '../types'
import { AIError } from '../types'

export abstract class BaseAIProvider implements AIProvider {
  abstract type: AIProviderType
  abstract name: string

  abstract chat(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse>

  abstract supportsModel(model: AIModel): boolean

  protected buildPrompt(messages: AIMessage[]): string {
    return messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join('\n\n')
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    retryCount: number = 2,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err
        if (attempt < retryCount) {
          await this.sleep(delayMs * Math.pow(2, attempt))
        }
      }
    }

    throw lastError
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  protected assertMessages(messages: AIMessage[]): void {
    if (!messages || messages.length === 0) {
      throw new AIError(
        'Messages cannot be empty',
        'INVALID_INPUT',
        this.type
      )
    }
  }
}
