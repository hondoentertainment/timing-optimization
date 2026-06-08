export const TOTAL_WEEKLY_HOURS = 168

export interface Settings {
  sleepHours: number
  workHours: number
}

export interface Interest {
  id: string
  name: string
  color: string
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

export type View = 'plan' | 'track' | 'review' | 'interests' | 'settings'

export interface TrendRow {
  interestId: string
  name: string
  color: string
  avgPlanned: number
  avgActual: number
  avgDelta: number
}
