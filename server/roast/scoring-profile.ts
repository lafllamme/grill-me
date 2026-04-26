import type { RoastScoringProfile } from './scoring'
import { safeQuery } from '../utils/db'
import { DEFAULT_ROAST_SCORING_PROFILE } from './scoring'

interface RawScoringProfileRow {
  version: string
  weights_json: unknown
  thresholds_json: unknown
  titles_json: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toScoringProfile(row: RawScoringProfileRow): RoastScoringProfile | null {
  const weights = row.weights_json
  const thresholds = row.thresholds_json
  const titles = row.titles_json

  if (!isRecord(weights) || !Array.isArray(thresholds) || !isRecord(titles))
    return null

  const normalized: RoastScoringProfile = {
    version: String(row.version || DEFAULT_ROAST_SCORING_PROFILE.version),
    weights: {
      volume: Number(weights.volume) || DEFAULT_ROAST_SCORING_PROFILE.weights.volume,
      churn: Number(weights.churn) || DEFAULT_ROAST_SCORING_PROFILE.weights.churn,
      entropy: Number(weights.entropy) || DEFAULT_ROAST_SCORING_PROFILE.weights.entropy,
      intensity: Number(weights.intensity) || DEFAULT_ROAST_SCORING_PROFILE.weights.intensity,
      signal: Number(weights.signal) || DEFAULT_ROAST_SCORING_PROFILE.weights.signal,
    },
    gradeThresholds: thresholds
      .map((item): RoastScoringProfile['gradeThresholds'][number] | null => {
        if (!isRecord(item))
          return null
        const min = Number(item.min)
        const grade = String(item.grade)
        if (!Number.isFinite(min))
          return null
        if (!['F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A'].includes(grade))
          return null
        return { min, grade: grade as RoastScoringProfile['gradeThresholds'][number]['grade'] }
      })
      .filter(Boolean) as RoastScoringProfile['gradeThresholds'],
    specialTitles: {
      'F-': String(titles['F-'] || DEFAULT_ROAST_SCORING_PROFILE.specialTitles['F-']),
      'F': String(titles.F || DEFAULT_ROAST_SCORING_PROFILE.specialTitles.F),
      'D-': String(titles['D-'] || DEFAULT_ROAST_SCORING_PROFILE.specialTitles['D-']),
      'D': String(titles.D || DEFAULT_ROAST_SCORING_PROFILE.specialTitles.D),
      'C-': String(titles['C-'] || DEFAULT_ROAST_SCORING_PROFILE.specialTitles['C-']),
      'C': String(titles.C || DEFAULT_ROAST_SCORING_PROFILE.specialTitles.C),
      'B': String(titles.B || DEFAULT_ROAST_SCORING_PROFILE.specialTitles.B),
      'A': String(titles.A || DEFAULT_ROAST_SCORING_PROFILE.specialTitles.A),
    },
  }

  if (normalized.gradeThresholds.length === 0)
    return null

  return normalized
}

/**
 * Loads the active scoring profile from Neon DB.
 *
 * @remarks
 * Falls back to the built-in profile if no active row exists or DB is unavailable.
 */
export async function resolveActiveScoringProfile(databaseUrl?: string): Promise<RoastScoringProfile> {
  const result = await safeQuery(databaseUrl, async (sql) => {
    const rows = await sql`
      SELECT version, weights_json, thresholds_json, titles_json
      FROM roast_scoring_profiles
      WHERE is_active = TRUE
      ORDER BY id DESC
      LIMIT 1
    ` as RawScoringProfileRow[]
    return rows[0] || null
  })

  if (!result)
    return DEFAULT_ROAST_SCORING_PROFILE

  return toScoringProfile(result) || DEFAULT_ROAST_SCORING_PROFILE
}
