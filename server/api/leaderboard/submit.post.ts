import type { RoastReceiptPayload } from '../../roast/receipt'
import { createError } from 'h3'
import {
  leaderboardSubmitRequestSchema,
  leaderboardSubmitResponseSchema,
} from '~~/shared/roast/contracts'
import { isSelfRoast } from '../../auth/ownership'
import { requireGithubSession } from '../../auth/session'
import { resolveRoastDatabaseError } from '../../roast/db-error'
import { logServerInfo } from '../../roast/debug'
import {
  persistReceiptAsRun,
  upsertAuthGithubUser,
  upsertOfficialLeaderboardEntry,
} from '../../roast/leaderboard-repository'
import { RoastReceiptError, verifyRoastReceipt } from '../../roast/receipt'
import { resolveActiveScoringProfile } from '../../roast/scoring-profile'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = leaderboardSubmitRequestSchema.parse(await readBody(event))
  const session = await requireGithubSession(event)
  const receiptSecret = (config.roastReceiptSecret || '').trim()

  if (!receiptSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing roast receipt secret',
      data: { code: 'receipt_secret_missing' },
    })
  }

  let receiptPayload: RoastReceiptPayload
  try {
    receiptPayload = verifyRoastReceipt(receiptSecret, body.receipt)
  }
  catch (error) {
    if (error instanceof RoastReceiptError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: { code: error.code },
      })
    }
    throw error
  }

  if (!isSelfRoast(session.user.login, receiptPayload.username)) {
    logServerInfo('official-submit-rejected', {
      requestId: receiptPayload.requestId,
      sessionLogin: session.user.login,
      roastUsername: receiptPayload.username,
      reason: 'not_self',
    })

    throw createError({
      statusCode: 403,
      statusMessage: 'Only the verified owner can submit this roast',
      data: { code: 'official_submit_not_owner' },
    })
  }

  let persistedRunId = ''
  let authUserId = 0
  try {
    const scoringProfile = await resolveActiveScoringProfile(config.databaseUrl || undefined)
    const persisted = await persistReceiptAsRun(config.databaseUrl || undefined, {
      payload: receiptPayload,
      scoringProfile,
    })

    authUserId = await upsertAuthGithubUser(config.databaseUrl || undefined, {
      githubId: session.user.githubId,
      username: session.user.login,
      avatarUrl: session.user.avatarUrl,
    })

    await upsertOfficialLeaderboardEntry(config.databaseUrl || undefined, {
      roastUserId: persisted.roastUserId,
      runId: persisted.runId,
      submittedByAuthUserId: authUserId,
    })
    persistedRunId = persisted.runId
  }
  catch (error) {
    const mappedError = resolveRoastDatabaseError(error)
    if (mappedError) {
      throw createError({
        statusCode: mappedError.statusCode,
        statusMessage: mappedError.statusMessage,
        data: { code: mappedError.code },
      })
    }
    throw error
  }

  const submittedAt = new Date().toISOString()
  logServerInfo('official-submit-accepted', {
    requestId: receiptPayload.requestId,
    username: receiptPayload.username,
    runId: persistedRunId,
    submittedByAuthUserId: authUserId,
    submittedAt,
  })

  return leaderboardSubmitResponseSchema.parse({
    ok: true,
    username: receiptPayload.username,
    submittedAt,
  })
})
