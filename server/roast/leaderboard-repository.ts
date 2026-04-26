import type {
  LeaderboardItem,
  LeaderboardResponse,
  LeaderboardWindow,
  RoastMetrics,
  RoastResponse,
} from '~~/shared/roast/contracts'
import type { RoastScoringProfile } from './scoring'
import { safeQuery } from '../utils/db'

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

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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
    lastRoastedAt: String(row.last_roasted_at || new Date(0).toISOString()),
    runsCount: toNumber(row.runs_count),
    metrics,
  }
}

export async function persistRoastRun(databaseUrl: string | undefined, input: PersistRoastRunInput): Promise<void> {
  await safeQuery(databaseUrl, async (sql) => {
    const userRows = await sql`
      INSERT INTO roast_users (username, last_roasted_at, updated_at)
      VALUES (${input.response.username}, NOW(), NOW())
      ON CONFLICT (username)
      DO UPDATE SET last_roasted_at = NOW(), updated_at = NOW()
      RETURNING id
    ` as Array<{ id: number }>
    const userId = userRows[0]?.id
    if (!userId)
      return

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
      ON CONFLICT (request_id) DO UPDATE SET request_id = EXCLUDED.request_id
      RETURNING id
    ` as Array<{ id: string }>

    const runId = runRows[0]?.id
    if (!runId)
      return

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
  })
}

/**
 * Returns leaderboard entries for all-time or the last 24 hours.
 */
export async function getLeaderboard(
  databaseUrl: string | undefined,
  options: { window: LeaderboardWindow, limit: number, search?: string },
): Promise<LeaderboardResponse> {
  const limit = Math.min(100, Math.max(1, options.limit))
  const search = options.search?.trim()
  const searchPattern = search ? `%${search.toLowerCase()}%` : null

  const items = await safeQuery(databaseUrl, async (sql) => {
    if (options.window === '24h') {
      const rows = await sql`
        WITH period_runs AS (
          SELECT
            ru.username,
            rr.user_id,
            MAX(rr.created_at) AS last_roasted_at,
            COUNT(*)::int AS runs_count,
            AVG(rm.spaghetti_index)::numeric(5,2) AS spaghetti_index,
            AVG(rm.stink_score)::numeric(5,2) AS stink_score,
            AVG(rm.ego_damage)::numeric(5,2) AS ego_damage
          FROM roast_runs rr
          JOIN roast_users ru ON ru.id = rr.user_id
          JOIN roast_run_metrics rm ON rm.run_id = rr.id
          WHERE rr.created_at >= NOW() - INTERVAL '24 hours'
          GROUP BY ru.username, rr.user_id
        ),
        latest_titles AS (
          SELECT DISTINCT ON (rr.user_id)
            rr.user_id,
            rm.grade,
            rm.special_title
          FROM roast_runs rr
          JOIN roast_run_metrics rm ON rm.run_id = rr.id
          WHERE rr.created_at >= NOW() - INTERVAL '24 hours'
          ORDER BY rr.user_id, rr.created_at DESC
        )
        SELECT
          p.username,
          p.last_roasted_at,
          p.runs_count,
          p.spaghetti_index,
          p.stink_score,
          p.ego_damage,
          l.grade,
          l.special_title
        FROM period_runs p
        JOIN latest_titles l ON l.user_id = p.user_id
        WHERE (${searchPattern}::text IS NULL OR LOWER(p.username) LIKE ${searchPattern})
        ORDER BY p.stink_score DESC, p.ego_damage DESC, p.last_roasted_at DESC
        LIMIT ${limit}
      ` as Record<string, unknown>[]
      return rows
    }

    const rows = await sql`
      SELECT
        ru.username,
        ru.last_roasted_at,
        rus.runs_count,
        rm.spaghetti_index,
        rus.avg_stink_score AS stink_score,
        rus.avg_ego_damage AS ego_damage,
        rus.worst_grade AS grade,
        rm.special_title
      FROM roast_user_stats rus
      JOIN roast_users ru ON ru.id = rus.user_id
      LEFT JOIN roast_run_metrics rm ON rm.run_id = rus.latest_run_id
      WHERE (${searchPattern}::text IS NULL OR LOWER(ru.username) LIKE ${searchPattern})
      ORDER BY rus.avg_stink_score DESC, rus.avg_ego_damage DESC, ru.last_roasted_at DESC NULLS LAST
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
 * Returns recent runs for one username.
 */
export async function getLeaderboardUserDetail(
  databaseUrl: string | undefined,
  username: string,
): Promise<LeaderboardUserDetail | null> {
  const result = await safeQuery(databaseUrl, async (sql) => {
    const rows = await sql`
      SELECT
        rr.id AS run_id,
        rr.created_at,
        rc.title,
        rm.spaghetti_index,
        rm.stink_score,
        rm.ego_damage,
        rm.grade,
        rm.special_title
      FROM roast_users ru
      JOIN roast_runs rr ON rr.user_id = ru.id
      JOIN roast_run_content rc ON rc.run_id = rr.id
      JOIN roast_run_metrics rm ON rm.run_id = rr.id
      WHERE LOWER(ru.username) = LOWER(${username})
      ORDER BY rr.created_at DESC
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
      createdAt: String(row.created_at || ''),
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
