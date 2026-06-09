export const TOTAL_WEEKLY_HOURS = 168

export interface Settings {
  sleepHours: number
  workHours: number
}

export interface Interest {
  id: string
  name: string
  color: string
  goalHours?: number
}

export interface WeekData {
  planned: Record<string, number>
  actual: Record<string, number>
  notes?: string
}

export interface AppState {
  settings: Settings
  interests: Interest[]
  weeks: Record<string, WeekData>
}

export type View = 'home' | 'plan' | 'track' | 'review' | 'interests' | 'settings'

export interface TrendRow {
  interestId: string
  name: string
  color: string
  avgPlanned: number
  avgActual: number
  avgDelta: number
  weeklyActuals: number[]
  chronicUnder: boolean
}

export interface DashboardInsight {
  type: 'under' | 'over' | 'goal' | 'unallocated'
  interestName: string
  message: string
}
