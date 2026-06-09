import { INTEREST_COLORS, LEGACY_GRAY_COLORS } from './constants'
import type { AppState, Interest } from './types'

const STORAGE_KEY = 'timing-optimization'
const EXPORT_VERSION = 1

const DEFAULT_STATE: AppState = {
  settings: { sleepHours: 56, workHours: 40 },
  interests: [],
  weeks: {},
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return normalizeState(JSON.parse(raw))
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function migrateInterestColors(interests: Interest[]): Interest[] {
  const needsMigration = interests.some((i) => LEGACY_GRAY_COLORS.has(i.color))
  if (!needsMigration) return interests

  return interests.map((interest, index) => ({
    ...interest,
    color: INTEREST_COLORS[index % INTEREST_COLORS.length],
  }))
}

function normalizeState(parsed: Partial<AppState>): AppState {
  const interests = migrateInterestColors(parsed.interests ?? [])
  return {
    settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    interests,
    weeks: parsed.weeks ?? {},
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify({ version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data: state }, null, 2)
}

export function importState(raw: string): { ok: true; state: AppState } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw)
    const data = parsed.data ?? parsed
    if (!data.settings || !Array.isArray(data.interests) || typeof data.weeks !== 'object') {
      return { ok: false, error: 'Invalid backup format' }
    }
    return { ok: true, state: normalizeState(data) }
  } catch {
    return { ok: false, error: 'Could not parse JSON' }
  }
}
