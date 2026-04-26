import type { RoastMeta, RoastMetrics } from '~~/shared/roast/contracts'
import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const RECEIPT_VERSION = 1
const DEFAULT_RECEIPT_TTL_SECONDS = 60 * 30

const roastReceiptPayloadSchema = z.object({
  v: z.literal(RECEIPT_VERSION),
  requestId: z.string().min(4),
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  source: z.enum(['sync', 'stream']),
  roastIntensity: z.number().int().min(1).max(4),
  username: z.string().min(1),
  title: z.string().min(1),
  roastLines: z.array(z.string()).min(1),
  feedback: z.array(z.string()).min(1),
  roast: z.string().min(1),
  meta: z.object({
    commitCount: z.number().int().nonnegative(),
    prCount: z.number().int().nonnegative(),
    selectedCommitCount: z.number().int().nonnegative().optional(),
  }),
  metrics: z.object({
    spaghettiIndex: z.number().min(0).max(100),
    stinkScore: z.number().min(0).max(100),
    egoDamage: z.number().min(0).max(100),
    grade: z.enum(['F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A']),
    specialTitle: z.string().min(1),
  }),
})

export type RoastReceiptPayload = z.infer<typeof roastReceiptPayloadSchema>

export class RoastReceiptError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

interface CreateRoastReceiptInput {
  requestId: string
  username: string
  title: string
  roastLines: string[]
  feedback: string[]
  roast: string
  meta: RoastMeta
  metrics: RoastMetrics
  source: 'sync' | 'stream'
  roastIntensity: number
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payloadEncoded: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64url')
}

/**
 * Verifies HMAC signatures using constant-time comparison.
 */
function isValidSignature(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')

  if (actualBuffer.length !== expectedBuffer.length)
    return false

  return timingSafeEqual(actualBuffer, expectedBuffer)
}

function parseReceiptToken(receipt: string): { payloadEncoded: string, signature: string } {
  const parts = receipt.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new RoastReceiptError(400, 'receipt_invalid', 'Invalid roast receipt format')
  }

  return {
    payloadEncoded: parts[0],
    signature: parts[1],
  }
}

export function createRoastReceipt(secret: string, input: CreateRoastReceiptInput): string {
  const issuedAt = Date.now()
  const payload: RoastReceiptPayload = {
    v: RECEIPT_VERSION,
    requestId: input.requestId,
    issuedAt,
    expiresAt: issuedAt + (DEFAULT_RECEIPT_TTL_SECONDS * 1000),
    source: input.source,
    roastIntensity: Math.min(4, Math.max(1, Math.round(input.roastIntensity || 2))),
    username: input.username,
    title: input.title,
    roastLines: input.roastLines,
    feedback: input.feedback,
    roast: input.roast,
    meta: input.meta,
    metrics: input.metrics,
  }

  const payloadJson = JSON.stringify(payload)
  const payloadEncoded = toBase64Url(payloadJson)
  const signature = sign(payloadEncoded, secret)
  return `${payloadEncoded}.${signature}`
}

export function verifyRoastReceipt(secret: string, receipt: string): RoastReceiptPayload {
  const { payloadEncoded, signature } = parseReceiptToken(receipt)
  const expectedSignature = sign(payloadEncoded, secret)

  if (!isValidSignature(signature, expectedSignature)) {
    throw new RoastReceiptError(401, 'receipt_invalid_signature', 'Invalid roast receipt signature')
  }

  let decodedJson = ''
  try {
    decodedJson = fromBase64Url(payloadEncoded)
  }
  catch {
    throw new RoastReceiptError(400, 'receipt_invalid_payload', 'Invalid roast receipt payload encoding')
  }

  let decodedPayload: unknown
  try {
    decodedPayload = JSON.parse(decodedJson)
  }
  catch {
    throw new RoastReceiptError(400, 'receipt_invalid_payload', 'Invalid roast receipt payload encoding')
  }

  const parsed = roastReceiptPayloadSchema.safeParse(decodedPayload)
  if (!parsed.success) {
    throw new RoastReceiptError(400, 'receipt_invalid_payload', 'Invalid roast receipt payload')
  }

  if (Date.now() > parsed.data.expiresAt) {
    throw new RoastReceiptError(401, 'receipt_expired', 'Roast receipt expired')
  }

  return parsed.data
}
