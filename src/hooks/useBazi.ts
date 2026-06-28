import { useState, useCallback } from 'react'
import { calculateBaZi, type BaZiChart, type BirthInfo } from '../lib/bazi'

const STORAGE_KEY = 'xuanfengmen_bazi_charts'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface UseBaziResult {
  status: Status
  chart: BaZiChart | null
  error: string | null
  charts: BaZiChart[]
  calculateChart: (info: BirthInfo) => void
  saveChart: (chart: BaZiChart) => void
  loadCharts: () => void
  deleteChart: (createdAt: number) => void
}

function loadFromStorage(): BaZiChart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BaZiChart[]
  } catch {
    return []
  }
}

function saveToStorage(charts: BaZiChart[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
  } catch {
  }
}

export function useBazi(): UseBaziResult {
  const [status, setStatus] = useState<Status>('idle')
  const [chart, setChart] = useState<BaZiChart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [charts, setCharts] = useState<BaZiChart[]>(() => loadFromStorage())

  const calculateChart = useCallback((info: BirthInfo) => {
    try {
      setStatus('loading')
      setError(null)
      const result = calculateBaZi(info)
      setChart(result)
      setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : '排盘失败')
      setStatus('error')
    }
  }, [])

  const saveChart = useCallback((newChart: BaZiChart) => {
    setCharts(prev => {
      const exists = prev.some(c => c.createdAt === newChart.createdAt)
      if (exists) return prev
      const updated = [newChart, ...prev].slice(0, 20)
      saveToStorage(updated)
      return updated
    })
  }, [])

  const loadCharts = useCallback(() => {
    const data = loadFromStorage()
    setCharts(data)
  }, [])

  const deleteChart = useCallback((createdAt: number) => {
    setCharts(prev => {
      const updated = prev.filter(c => c.createdAt !== createdAt)
      saveToStorage(updated)
      return updated
    })
  }, [])

  return {
    status,
    chart,
    error,
    charts,
    calculateChart,
    saveChart,
    loadCharts,
    deleteChart,
  }
}
