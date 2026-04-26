import type {
  LeaderboardItem,
  LeaderboardResponse,
  LeaderboardWindow,
  RoastMetrics,
  RoastResponse,
  RoastShareResolveResponse,
} from '~~/shared/roast/contracts'
import type { RoastReceiptPayload } from './receipt'
import type { RoastScoringProfile } from './scoring'
import { createError } from 'h3'
import { requireSqlExecutor } from '../utils/db'

export interface PersistRoastRunInput {
  requestId: string
  source: 'sync' | 'stream'
  roastIntensity: number
  model?: string
  promptVersion?: string
  response: RoastResponse
  scoringProfile: RoastScoringProfile
}

interface LeaderboardUserRunDetail {
  runId: string
  createdAt: string
  title: string
  metrics: RoastMetrics
}

interface LeaderboardUserDetail {
  username: string
  runs: LeaderboardUserRunDetail[]
}

export interface UpsertAuthGithubUserInput {
  githubId: string
  username: string
  avatarUrl?: string
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value))
    return value.map(item => String(item)).filter(Boolean)

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(item => String(item)).filter(Boolean) : []
    }
    catch {
      return []
    }
  }

  return []
}

function toIsoDateTime(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value instanceof Date)
    return value.toISOString()

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed)
      return fallback

    const parsedMs = Date.parse(trimmed)
    if (!Number.isNaN(parsedMs))
      return new Date(parsedMs).toISOString()
  }

  return fallback
}

function mapLeaderboardItem(index: number, row: Record<string, unknown>): LeaderboardItem {
  const metrics: RoastMetrics = {
    spaghettiIndex: toNumber(row.spaghetti_index),
    stinkScore: toNumber(row.stink_score),
    egoDamage: toNumber(row.ego_damage),
    grade: String(row.grade || 'A') as RoastMetrics['grade'],
    specialTitle: String(row.special_title || 'Barely Production Safe'),
  }

  return {
    rank: index + 1,
    username: String(row.username || ''),
    lastRoastedAt: toIsoDateTime(row.last_roasted_at),
    runsCount: toNumber(row.runs_count),
    metrics,
  }
}

/**
 * Persists one canonical roast run (metadata + content + metrics + user stats).
 * Uses request_id idempotency, so repeated calls safely upsert the same run.
 */
export async function persistRoastRun(databaseUrl: string | undefined, input: PersistRoastRunInput): Promise<{ runId: string, userId: number }> {
  const sql = requireSqlExecutor(databaseUrl)

  const userRows = await sql`
    INSERT INTO roast_users (username, last_roasted_at, updated_at)
    VALUES (${input.response.username}, NOW(), NOW())
    ON CONFLICT (username)
    DO UPDATE SET last_roasted_at = NOW(), updated_at = NOW()
    RETURNING id
  ` as Array<{ id: number }>
  const userId = userRows[0]?.id
  if (!userId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to persist roast user',
      data: { code: 'db_user_upsert_failed' },
    })
  }

  const runRows = await sql`
    INSERT INTO roast_runs (
      request_id,
      user_id,
      source,
      roast_intensity,
      commit_count,
      selected_commit_count,
      pr_count,
      model,
      prompt_version
    )
    VALUES (
      ${input.requestId},
      ${userId},
      ${input.source},
      ${input.roastIntensity},
      ${input.response.meta.commitCount},
      ${input.response.meta.selectedCommitCount || 0},
      ${input.response.meta.prCount},
      ${input.model || null},
      ${input.promptVersion || null}
    )
    ON CONFLICT (request_id)
    DO UPDATE SET
      roast_intensity = EXCLUDED.roast_intensity,
      commit_count = EXCLUDED.commit_count,
      selected_commit_count = EXCLUDED.selected_commit_count,
      pr_count = EXCLUDED.pr_count,
      model = EXCLUDED.model,
      prompt_version = EXCLUDED.prompt_version
    RETURNING id
  ` as Array<{ id: string }>

  const runId = runRows[0]?.id
  if (!runId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to persist roast run',
      data: { code: 'db_run_upsert_failed' },
    })
  }

  await sql`
    INSERT INTO roast_run_content (run_id, title, roast_lines, feedback, roast_text)
    VALUES (
      ${runId},
      ${input.response.title},
      ${JSON.stringify(input.response.roastLines)}::jsonb,
      ${JSON.stringify(input.response.feedback)}::jsonb,
      ${input.response.roast}
    )
    ON CONFLICT (run_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      roast_lines = EXCLUDED.roast_lines,
      feedback = EXCLUDED.feedback,
      roast_text = EXCLUDED.roast_text
  `

  await sql`
    INSERT INTO roast_run_metrics (
      run_id,
      spaghetti_index,
      stink_score,
      ego_damage,
      grade,
      special_title,
      metric_version
    )
    VALUES (
      ${runId},
      ${input.response.metrics.spaghettiIndex},
      ${input.response.metrics.stinkScore},
      ${input.response.metrics.egoDamage},
      ${input.response.metrics.grade},
      ${input.response.metrics.specialTitle},
      ${input.scoringProfile.version}
    )
    ON CONFLICT (run_id)
    DO UPDATE SET
      spaghetti_index = EXCLUDED.spaghetti_index,
      stink_score = EXCLUDED.stink_score,
      ego_damage = EXCLUDED.ego_damage,
      grade = EXCLUDED.grade,
      special_title = EXCLUDED.special_title,
      metric_version = EXCLUDED.metric_version
  `

  await sql`
    INSERT INTO roast_user_stats (
      user_id,
      runs_count,
      avg_stink_score,
      avg_ego_damage,
      worst_grade,
      latest_run_id,
      updated_at
    )
    SELECT
      ${userId},
      COUNT(*)::int,
      COALESCE(AVG(rm.stink_score), 0),
      COALESCE(AVG(rm.ego_damage), 0),
      (
        SELECT rm2.grade
        FROM roast_runs rr2
        JOIN roast_run_metrics rm2 ON rm2.run_id = rr2.id
        WHERE rr2.user_id = ${userId}
        ORDER BY CASE rm2.grade
          WHEN 'F-' THEN 1
          WHEN 'F' THEN 2
          WHEN 'D-' THEN 3
          WHEN 'D' THEN 4
          WHEN 'C-' THEN 5
          WHEN 'C' THEN 6
          WHEN 'B' THEN 7
          ELSE 8
        END ASC
        LIMIT 1
      ),
      ${runId},
      NOW()
    FROM roast_runs rr
    JOIN roast_run_metrics rm ON rm.run_id = rr.id
    WHERE rr.user_id = ${userId}
    ON CONFLICT (user_id)
    DO UPDATE SET
      runs_count = EXCLUDED.runs_count,
      avg_stink_score = EXCLUDED.avg_stink_score,
      avg_ego_damage = EXCLUDED.avg_ego_damage,
      worst_grade = EXCLUDED.worst_grade,
      latest_run_id = EXCLUDED.latest_run_id,
      updated_at = NOW()
  `

  return { runId, userId }
}

export async function upsertAuthGithubUser(databaseUrl: string | undefined, input: UpsertAuthGithubUserInput): Promise<number> {
  const sql = requireSqlExecutor(databaseUrl)
  const rows = await sql`
    INSERT INTO auth_github_users (github_id, username, avatar_url, updated_at)
    VALUES (${input.githubId}, ${input.username}, ${input.avatarUrl || null}, NOW())
    ON CONFLICT (github_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW()
    RETURNING id
  ` as Array<{ id: number }>

  const userId = rows[0]?.id
  if (!userId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to persist auth user',
      data: { code: 'db_auth_user_upsert_failed' },
    })
  }

  return userId
}

interface PersistReceiptAsRunInput {
  payload: RoastReceiptPayload
  scoringProfile: RoastScoringProfile
}

export async function persistReceiptAsRun(
  databaseUrl: string | undefined,
  input: PersistReceiptAsRunInput,
): Promise<{ runId: string, roastUserId: number }> {
  const response: RoastResponse = {
    username: input.payload.username,
    title: input.payload.title,
    roastLines: input.payload.roastLines,
    roast: input.payload.roast,
    feedback: input.payload.feedback,
    meta: input.payload.meta,
    metrics: input.payload.metrics,
    receipt: '',
  }

  const persisted = await persistRoastRun(databaseUrl, {
    requestId: input.payload.requestId,
    source: input.payload.source,
    roastIntensity: input.payload.roastIntensity,
    response,
    scoringProfile: input.scoringProfile,
  })

  return {
    runId: persisted.runId,
    roastUserId: persisted.userId,
  }
}

export async function createRoastShare(
  databaseUrl: string | undefined,
  input: { runId: string, ttlHours: number },
): Promise<{ token: string, expiresAt: string }> {
  const sql = requireSqlExecutor(databaseUrl)
  const expiresAt = new Date(Date.now() + (input.ttlHours * 60 * 60 * 1000)).toISOString()
  const token = `share_${crypto.randomUUID().replace(/-/g, '')}`

  await sql`
    INSERT INTO roast_shares (token, run_id, expires_at)
    VALUES (${token}, ${input.runId}, ${expiresAt})
    ON CONFLICT (token)
    DO UPDATE SET
      run_id = EXCLUDED.run_id,
      expires_at = EXCLUDED.expires_at
  `

  return { token, expiresAt }
}

export async function getRoastShareByToken(
  databaseUrl: string | undefined,
  token: string,
): Promise<RoastShareResolveResponse | null> {
  const sql = requireSqlExecutor(databaseUrl)
  const rows = await sql`
    SELECT
      rs.token,
      rs.expires_at,
      ru.username,
      rc.title,
      rc.roast_lines,
      rc.feedback,
      rc.roast_text,
      rr.commit_count,
      rr.pr_count,
      rr.selected_commit_count,
      rm.spaghetti_index,
      rm.stink_score,
      rm.ego_damage,
      rm.grade,
      rm.special_title
    FROM roast_shares rs
    JOIN roast_runs rr ON rr.id = rs.run_id
    JOIN roast_users ru ON ru.id = rr.user_id
    JOIN roast_run_content rc ON rc.run_id = rr.id
    JOIN roast_run_metrics rm ON rm.run_id = rr.id
    WHERE rs.token = ${token}
      AND rs.expires_at > NOW()
    LIMIT 1
  ` as Record<string, unknown>[]
  const result = rows[0] || null

  if (!result)
    return null

  const roastLines = toStringArray(result.roast_lines)
  const feedback = toStringArray(result.feedback)

  return {
    token: String(result.token || token),
    expiresAt: toIsoDateTime(result.expires_at),
    data: {
      username: String(result.username || ''),
      title: String(result.title || ''),
      roastLines,
      roast: String(result.roast_text || ''),
      feedback,
      meta: {
        commitCount: toNumber(result.commit_count),
        prCount: toNumber(result.pr_count),
        selectedCommitCount: toNumber(result.selected_commit_count),
      },
      metrics: {
        spaghettiIndex: toNumber(result.spaghetti_index),
        stinkScore: toNumber(result.stink_score),
        egoDamage: toNumber(result.ego_damage),
        grade: String(result.grade || 'A') as RoastMetrics['grade'],
        specialTitle: String(result.special_title || 'Barely Production Safe'),
      },
    },
  }
}

export async function upsertOfficialLeaderboardEntry(
  databaseUrl: string | undefined,
  input: {
    roastUserId: number
    runId: string
    submittedByAuthUserId: number
  },
): Promise<void> {
  const sql = requireSqlExecutor(databaseUrl)
  await sql`
    INSERT INTO leaderboard_entries (
      roast_user_id,
      run_id,
      submitted_by_auth_user_id,
      submitted_at,
      updated_at
    )
    VALUES (
      ${input.roastUserId},
      ${input.runId},
      ${input.submittedByAuthUserId},
      NOW(),
      NOW()
    )
    ON CONFLICT (roast_user_id)
    DO UPDATE SET
      run_id = EXCLUDED.run_id,
      submitted_by_auth_user_id = EXCLUDED.submitted_by_auth_user_id,
      submitted_at = NOW(),
      updated_at = NOW()
  `
}

/**
 * Returns official leaderboard entries for all-time or the last 24 hours.
 */
export async function getLeaderboard(
  databaseUrl: string | undefined,
  options: { window: LeaderboardWindow, limit: number, search?: string },
): Promise<LeaderboardResponse> {
  const limit = Math.min(100, Math.max(1, options.limit))
  const search = options.search?.trim()
  const searchPattern = search ? `%${search.toLowerCase()}%` : null

  const items = await safeQuery(databaseUrl, async (sql) => {
    const rows = await sql`
      SELECT
        ru.username,
        le.submitted_at AS last_roasted_at,
        COALESCE(rus.runs_count, 0) AS runs_count,
        rm.spaghetti_index,
        rm.stink_score,
        rm.ego_damage,
        rm.grade,
        rm.special_title
      FROM leaderboard_entries le
      JOIN roast_users ru ON ru.id = le.roast_user_id
      JOIN roast_run_metrics rm ON rm.run_id = le.run_id
      LEFT JOIN roast_user_stats rus ON rus.user_id = ru.id
      WHERE (${searchPattern}::text IS NULL OR LOWER(ru.username) LIKE ${searchPattern})
        AND (
          ${options.window}::text <> '24h'
          OR le.submitted_at >= NOW() - INTERVAL '24 hours'
        )
      ORDER BY rm.stink_score DESC, rm.ego_damage DESC, le.submitted_at DESC
      LIMIT ${limit}
    ` as Record<string, unknown>[]

    return rows
  })

  const mapped = (items || []).map((row, index) => mapLeaderboardItem(index, row))
  return {
    window: options.window,
    limit,
    items: mapped,
  }
}

/**
 * Returns recent official leaderboard runs for one username.
 */
export async function getLeaderboardUserDetail(
  databaseUrl: string | undefined,
  username: string,
): Promise<LeaderboardUserDetail | null> {
  const result = await safeQuery(databaseUrl, async (sql) => {
    const rows = await sql`
      SELECT
        rr.id AS run_id,
        le.submitted_at AS created_at,
        rc.title,
        rm.spaghetti_index,
        rm.stink_score,
        rm.ego_damage,
        rm.grade,
        rm.special_title
      FROM roast_users ru
      JOIN leaderboard_entries le ON le.roast_user_id = ru.id
      JOIN roast_runs rr ON rr.id = le.run_id
      JOIN roast_run_content rc ON rc.run_id = rr.id
      JOIN roast_run_metrics rm ON rm.run_id = rr.id
      WHERE LOWER(ru.username) = LOWER(${username})
      ORDER BY le.submitted_at DESC
      LIMIT 20
    ` as Record<string, unknown>[]
    return rows
  })

  if (!result || result.length === 0)
    return null

  return {
    username,
    runs: result.map(row => ({
      runId: String(row.run_id || ''),
      createdAt: toIsoDateTime(row.created_at, new Date().toISOString()),
      title: String(row.title || ''),
      metrics: {
        spaghettiIndex: toNumber(row.spaghetti_index),
        stinkScore: toNumber(row.stink_score),
        egoDamage: toNumber(row.ego_damage),
        grade: String(row.grade || 'A') as RoastMetrics['grade'],
        specialTitle: String(row.special_title || 'Barely Production Safe'),
      },
    })),
  }
}
