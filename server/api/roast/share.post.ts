import type { RoastReceiptPayload } from '../../roast/receipt'
import { createError, getRequestHost, getRequestProtocol } from 'h3'
import {
  roastShareCreateRequestSchema,
  roastShareCreateResponseSchema,
} from '~~/shared/roast/contracts'
import { logServerInfo } from '../../roast/debug'
import {
  createRoastShare,
  persistReceiptAsRun,
} from '../../roast/leaderboard-repository'
import { RoastReceiptError, verifyRoastReceipt } from '../../roast/receipt'
import { resolveActiveScoringProfile } from '../../roast/scoring-profile'

const SHARE_TTL_HOURS = 24

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = roastShareCreateRequestSchema.parse(await readBody(event))
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
  const scoringProfile = await resolveActiveScoringProfile(config.databaseUrl || undefined)
  const persisted = await persistReceiptAsRun(config.databaseUrl || undefined, {
    payload: receiptPayload,
    scoringProfile,
  })

  const share = await createRoastShare(config.databaseUrl || undefined, {
    runId: persisted.runId,
    ttlHours: SHARE_TTL_HOURS,
  })

  const protocol = getRequestProtocol(event)
  const host = getRequestHost(event)
  const shareUrl = `${protocol}://${host}/share/${share.token}`

  logServerInfo('share-created', {
    requestId: receiptPayload.requestId,
    username: receiptPayload.username,
    runId: persisted.runId,
    token: share.token,
    expiresAt: share.expiresAt,
  })

  return roastShareCreateResponseSchema.parse({
    token: share.token,
    shareUrl,
    expiresAt: share.expiresAt,
  })
})
