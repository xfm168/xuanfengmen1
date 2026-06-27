import { BaseAIProvider } from './base'
import type {
  AIMessage,
  AIRequestOptions,
  AIResponse,
  AIModel,
  AIProviderType,
} from '../types'
import { AIError } from '../types'

export interface SupabaseEdgeConfig {
  supabaseUrl: string
  anonKey: string
  functionName?: string
  functionPath?: string
}

export class SupabaseEdgeProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'supabase-edge'
  readonly name = 'Supabase Edge Function'

  private config: SupabaseEdgeConfig
  private supportedModels: AIModel[] = ['supabase-edge', 'gemini-2.0-flash', 'gemini-2.0-pro']

  constructor(config: SupabaseEdgeConfig) {
    super()
    this.config = config
  }

  supportsModel(model: AIModel): boolean {
    return this.supportedModels.includes(model)
  }

  async chat(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    this.assertMessages(messages)

    const {
      retryCount = 2,
      timeoutMs = 60000,
      metadata = {},
    } = options

    const functionPath = this.config.functionPath
      ? this.config.functionPath
      : `${this.config.supabaseUrl}/functions/v1/${this.config.functionName || 'analyze'}`

    const execute = async (): Promise<AIResponse> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(functionPath, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            metadata,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 429) {
            throw AIError.RateLimit(this.type)
          }
          if (response.status >= 500) {
            throw AIError.ProviderUnavailable(
              this.type,
              new Error(`HTTP ${response.status}`)
            )
          }
          throw new AIError(
            `Edge function returned ${response.status}`,
            'HTTP_ERROR',
            this.type
          )
        }

        const data = await response.json()

        if (data.error) {
          throw new AIError(
            data.error,
            'AI_ERROR',
            this.type
          )
        }

        return {
          content: data.content ?? data.result ?? data.answer ?? '',
          model: (data.model as AIModel) || 'supabase-edge',
          provider: this.type,
          usage: data.usage,
          raw: data,
        }
      } catch (err) {
        if (err instanceof AIError) throw err
        if (err instanceof Error && err.name === 'AbortError') {
          throw AIError.Timeout(this.type, err)
        }
        throw AIError.ProviderUnavailable(this.type, err)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    return this.withRetry(execute, retryCount, 2000)
  }

  async callFunction<T = unknown>(
    functionName: string,
    payload: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.supabaseUrl}/functions/v1/${functionName}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new AIError(
        `Edge function "${functionName}" failed: ${response.status}`,
        'HTTP_ERROR',
        this.type
      )
    }

    return response.json() as Promise<T>
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.supabaseUrl}/rest/v1/`,
        {
          headers: {
            apikey: this.config.anonKey,
            Authorization: `Bearer ${this.config.anonKey}`,
          },
          method: 'GET',
        }
      )
      return response.ok
    } catch {
      return false
    }
  }
}
