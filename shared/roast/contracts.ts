import { z } from 'zod'

/**
 * GitHub username constraints from GitHub docs:
 * - 1-39 chars
 * - alphanumeric or single hyphen segments
 */
export const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

/**
 * Selection and normalization limits for GitHub evidence collection.
 */
export const ROAST_LIMITS = {
  eventsPerPage: 100,
  maxCommitRefs: 12,
  maxSelectedCommits: 8,
  maxPrs: 6,
  maxFilesPerCommit: 5,
  maxPatchChars: 700,
  maxPromptPatchChars: 260,
  maxPromptFilesPerCommit: 3,
  maxPromptTotalFiles: 18,
  maxPromptTotalPatchChars: 4500,
  maxResponsePreviewChars: 1000,
  maxRoastWords: 220,
  maxRoastLines: 7,
  maxFeedbackItems: 4,
  maxStreamChunkChars: 140,
} as const

export const ROAST_AI_TOKEN_BOUNDS = {
  min: 1000,
  max: 4000,
} as const

/**
 * Runtime defaults used if env values are missing or invalid.
 */
export const ROAST_DEFAULTS = {
  rateLimitWindowMs: 60_000,
  rateLimitMax: 8,
  githubTimeoutMs: 12_000,
  aiTimeoutMs: 25_000,
  aiMaxTokens: 2200,
  aiTemperature: 0.55,
  aiTopP: 0.92,
  promptVariationMode: 'moderate',
  roastIntensity: 2,
  debugLevel: 'minimal',
} as const

export const roastDebugLevelSchema = z.enum(['off', 'minimal', 'full'])
export type RoastDebugLevel = z.infer<typeof roastDebugLevelSchema>

export const roastVariationModeSchema = z.enum(['stable', 'moderate', 'wild'])
export type RoastVariationMode = z.infer<typeof roastVariationModeSchema>

export const roastIntensitySchema = z.number().int().min(1).max(4)
export type RoastIntensity = z.infer<typeof roastIntensitySchema>

export const roastRequestBodySchema = z.object({
  githubUsername: z.string().trim().min(1),
  includeDebug: z.union([z.boolean(), z.string(), z.number()]).optional(),
  debugLevel: roastDebugLevelSchema.optional(),
  variationMode: roastVariationModeSchema.optional(),
  roastIntensity: roastIntensitySchema.optional(),
  stream: z.union([z.boolean(), z.string(), z.number()]).optional(),
})

export type RoastRequestBody = z.infer<typeof roastRequestBodySchema>

/**
 * Shared request schema for the streaming endpoint.
 */
export const roastStreamRequestBodySchema = roastRequestBodySchema
export type RoastStreamRequestBody = z.infer<typeof roastStreamRequestBodySchema>

export const roastMetaSchema = z.object({
  commitCount: z.number().int().nonnegative(),
  prCount: z.number().int().nonnegative(),
  selectedCommitCount: z.number().int().nonnegative().optional(),
})

export type RoastMeta = z.infer<typeof roastMetaSchema>

export const debugRequestInfoSchema = z.object({
  stage: z.enum(['github_profile', 'github_events', 'github_commit', 'cloudflare_ai']),
  url: z.string(),
  durationMs: z.number().nonnegative(),
  ok: z.boolean(),
  statusCode: z.number().int().optional(),
})

export type DebugRequestInfo = z.infer<typeof debugRequestInfoSchema>

export const selectionSummarySchema = z.object({
  candidateCommits: z.number().int().nonnegative(),
  selectedCommits: z.number().int().nonnegative(),
  selectedFiles: z.number().int().nonnegative(),
  selectedPatchChars: z.number().int().nonnegative(),
  configuredMaxCommitRefs: z.number().int().nonnegative().optional(),
  configuredMaxSelectedCommits: z.number().int().nonnegative().optional(),
})

export type SelectionSummary = z.infer<typeof selectionSummarySchema>

export const intensityProfileSchema = z.object({
  level: z.number().int().min(1).max(4),
  label: z.enum(['rare', 'medium_rare', 'medium', 'burned_to_crisp']),
  maxCommitRefs: z.number().int().nonnegative(),
  maxSelectedCommits: z.number().int().nonnegative(),
  maxPromptTotalFiles: z.number().int().nonnegative(),
  maxPromptTotalPatchChars: z.number().int().nonnegative(),
  aiMaxTokens: z.number().int().nonnegative(),
  temperatureDelta: z.number(),
  effectiveTemperature: z.number().optional(),
})

export type IntensityProfile = z.infer<typeof intensityProfileSchema>

export const roastResultIntensitySchema = z.object({
  level: z.number().int().min(1).max(4),
  label: z.enum(['rare', 'medium_rare', 'medium', 'burned_to_crisp']),
})
export type RoastResultIntensity = z.infer<typeof roastResultIntensitySchema>

export const roastGradeSchema = z.enum(['F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A'])
export type RoastGrade = z.infer<typeof roastGradeSchema>

export const roastMetricsSchema = z.object({
  spaghettiIndex: z.number().min(0).max(100),
  stinkScore: z.number().min(0).max(100),
  egoDamage: z.number().min(0).max(100),
  grade: roastGradeSchema,
  specialTitle: z.string().min(1),
})
export type RoastMetrics = z.infer<typeof roastMetricsSchema>

export const roastReceiptSchema = z.string().min(20)
export type RoastReceipt = z.infer<typeof roastReceiptSchema>

export const roastDebugSchema = z.object({
  username: z.string(),
  promptVersion: z.string().optional(),
  parserPath: z.string().optional(),
  fallbackReason: z.string().optional(),
  selectionSummary: selectionSummarySchema.optional(),
  intensityProfile: intensityProfileSchema.optional(),
  timingsMs: z.object({
    githubFetch: z.number().optional(),
    aiGenerate: z.number().optional(),
    total: z.number().optional(),
  }),
  github: z.record(z.string(), z.unknown()).optional(),
  ai: z.record(z.string(), z.unknown()).optional(),
  scoring: z.record(z.string(), z.unknown()).optional(),
  requests: z.array(debugRequestInfoSchema),
})

export type RoastDebug = z.infer<typeof roastDebugSchema>

export const roastResponseSchema = z.object({
  username: z.string(),
  intensity: roastResultIntensitySchema,
  title: z.string().min(1),
  roastLines: z.array(z.string()).min(1),
  roast: z.string(),
  feedback: z.array(z.string()).min(1),
  meta: roastMetaSchema,
  metrics: roastMetricsSchema,
  receipt: roastReceiptSchema,
  debug: roastDebugSchema.optional(),
})

export type RoastResponse = z.infer<typeof roastResponseSchema>
export const roastPublicResultSchema = roastResponseSchema.omit({
  receipt: true,
  debug: true,
})
export type RoastPublicResult = z.infer<typeof roastPublicResultSchema>

export const roastErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export type RoastErrorResponse = z.infer<typeof roastErrorSchema>

export const roastStreamMetaEventSchema = z.object({
  type: z.literal('meta'),
  requestId: z.string(),
  username: z.string(),
})
export type RoastStreamMetaEvent = z.infer<typeof roastStreamMetaEventSchema>

export const roastStreamRoastTitleEventSchema = z.object({
  type: z.literal('roast_title'),
  title: z.string().min(1),
})
export type RoastStreamRoastTitleEvent = z.infer<typeof roastStreamRoastTitleEventSchema>

export const roastStreamRoastLineEventSchema = z.object({
  type: z.literal('roast_line'),
  index: z.number().int().nonnegative(),
  text: z.string().min(1),
})
export type RoastStreamRoastLineEvent = z.infer<typeof roastStreamRoastLineEventSchema>

export const roastStreamStatusEventSchema = z.object({
  type: z.literal('status'),
  phase: z.enum([
    'fetching_github',
    'selecting_evidence',
    'building_prompt',
    'calling_ai',
    'parsing_output',
    'finalizing',
  ]),
  message: z.string(),
})
export type RoastStreamStatusEvent = z.infer<typeof roastStreamStatusEventSchema>

export const roastStreamEvidenceEventSchema = z.object({
  type: z.literal('evidence'),
  commits: z.array(z.object({
    repo: z.string().min(1),
    sha: z.string().min(1),
    message: z.string(),
    additions: z.number().int().nonnegative(),
    deletions: z.number().int().nonnegative(),
    changedFiles: z.number().int().nonnegative(),
    files: z.array(z.object({
      filename: z.string().min(1),
      status: z.string().min(1),
      additions: z.number().int().nonnegative(),
      deletions: z.number().int().nonnegative(),
    })),
  })),
  prs: z.array(z.object({
    repo: z.string().min(1),
    title: z.string().min(1),
    url: z.string(),
    state: z.string().min(1),
  })),
})
export type RoastStreamEvidenceEvent = z.infer<typeof roastStreamEvidenceEventSchema>

export const roastStreamFeedbackItemEventSchema = z.object({
  type: z.literal('feedback_item'),
  index: z.number().int().nonnegative(),
  text: z.string().min(1),
})
export type RoastStreamFeedbackItemEvent = z.infer<typeof roastStreamFeedbackItemEventSchema>

export const roastStreamDebugEventSchema = z.object({
  type: z.literal('debug'),
  debug: roastDebugSchema,
})
export type RoastStreamDebugEvent = z.infer<typeof roastStreamDebugEventSchema>

export const roastStreamDoneEventSchema = z.object({
  type: z.literal('done'),
  data: roastResponseSchema,
})
export type RoastStreamDoneEvent = z.infer<typeof roastStreamDoneEventSchema>

export const roastStreamErrorEventSchema = z.object({
  type: z.literal('error'),
  error: roastErrorSchema.shape.error,
})
export type RoastStreamErrorEvent = z.infer<typeof roastStreamErrorEventSchema>

export const roastStreamEventSchema = z.discriminatedUnion('type', [
  roastStreamMetaEventSchema,
  roastStreamRoastTitleEventSchema,
  roastStreamRoastLineEventSchema,
  roastStreamStatusEventSchema,
  roastStreamEvidenceEventSchema,
  roastStreamFeedbackItemEventSchema,
  roastStreamDebugEventSchema,
  roastStreamDoneEventSchema,
  roastStreamErrorEventSchema,
])

export type RoastStreamEvent = z.infer<typeof roastStreamEventSchema>

export const leaderboardWindowSchema = z.enum(['all', '24h'])
export type LeaderboardWindow = z.infer<typeof leaderboardWindowSchema>

export const leaderboardItemSchema = z.object({
  rank: z.number().int().positive(),
  username: z.string(),
  lastRoastedAt: z.string(),
  runsCount: z.number().int().nonnegative(),
  metrics: roastMetricsSchema,
})
export type LeaderboardItem = z.infer<typeof leaderboardItemSchema>

export const leaderboardResponseSchema = z.object({
  window: leaderboardWindowSchema,
  limit: z.number().int().positive(),
  items: z.array(leaderboardItemSchema),
})
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>

export const roastShareCreateRequestSchema = z.object({
  receipt: roastReceiptSchema,
})
export type RoastShareCreateRequest = z.infer<typeof roastShareCreateRequestSchema>

export const roastShareCreateResponseSchema = z.object({
  token: z.string().min(12),
  shareUrl: z.string().min(1),
  expiresAt: z.string().datetime(),
})
export type RoastShareCreateResponse = z.infer<typeof roastShareCreateResponseSchema>

export const roastShareResolveResponseSchema = z.object({
  token: z.string().min(12),
  expiresAt: z.string().datetime(),
  data: roastPublicResultSchema,
})
export type RoastShareResolveResponse = z.infer<typeof roastShareResolveResponseSchema>

export const leaderboardSubmitRequestSchema = z.object({
  receipt: roastReceiptSchema,
})
export type LeaderboardSubmitRequest = z.infer<typeof leaderboardSubmitRequestSchema>

export const leaderboardSubmitResponseSchema = z.object({
  ok: z.boolean(),
  username: z.string(),
  submittedAt: z.string().datetime(),
})
export type LeaderboardSubmitResponse = z.infer<typeof leaderboardSubmitResponseSchema>

export interface RoastRuntimeOptions {
  includeDebug: boolean
  debugLevel: RoastDebugLevel
  githubTimeoutMs: number
  cfAiTimeoutMs: number
  cfAiMaxTokens: number
  cfAiTemperature: number
  cfAiTopP: number
  variationMode: RoastVariationMode
  roastIntensity: RoastIntensity
}

/**
 * Parses common truthy values from payload/env.
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean')
    return value

  if (typeof value === 'string')
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())

  if (typeof value === 'number')
    return value === 1

  return false
}

/**
 * Parses a positive number from unknown input with safe fallback.
 */
export function parsePositiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Parses a finite bounded number from unknown input.
 */
export function parseBoundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed))
    return fallback
  return Math.min(max, Math.max(min, parsed))
}

/**
 * Normalizes runtime options from request payload + Nuxt runtime config.
 */
export function resolveRoastRuntimeOptions(config: Record<string, unknown>, body: RoastRequestBody): RoastRuntimeOptions {
  const explicitDebugLevel = body.debugLevel
    ?? (typeof config.roastDebugLevel === 'string' ? config.roastDebugLevel : undefined)

  const normalizedDebugLevel = roastDebugLevelSchema.safeParse(explicitDebugLevel).success
    ? (explicitDebugLevel as RoastDebugLevel)
    : parseBoolean(body.includeDebug) || parseBoolean(config.roastDebug)
      ? 'full'
      : (ROAST_DEFAULTS.debugLevel as RoastDebugLevel)

  const variationModeInput = body.variationMode
    ?? (typeof config.roastVariationMode === 'string' ? config.roastVariationMode : undefined)
  const normalizedVariation = roastVariationModeSchema.safeParse(variationModeInput).success
    ? (variationModeInput as RoastVariationMode)
    : (ROAST_DEFAULTS.promptVariationMode as RoastVariationMode)

  const roastIntensityInput = body.roastIntensity
  const normalizedRoastIntensity = roastIntensitySchema.safeParse(roastIntensityInput).success
    ? (roastIntensityInput as RoastIntensity)
    : ROAST_DEFAULTS.roastIntensity

  return {
    includeDebug: normalizedDebugLevel !== 'off',
    debugLevel: normalizedDebugLevel,
    githubTimeoutMs: parsePositiveNumber(config.githubTimeoutMs, ROAST_DEFAULTS.githubTimeoutMs),
    cfAiTimeoutMs: parsePositiveNumber(config.cfAiTimeoutMs, ROAST_DEFAULTS.aiTimeoutMs),
    cfAiMaxTokens: parseBoundedNumber(config.cfAiMaxTokens, ROAST_DEFAULTS.aiMaxTokens, ROAST_AI_TOKEN_BOUNDS.min, ROAST_AI_TOKEN_BOUNDS.max),
    cfAiTemperature: parseBoundedNumber(config.cfAiTemperature, ROAST_DEFAULTS.aiTemperature, 0, 1.2),
    cfAiTopP: parseBoundedNumber(config.cfAiTopP, ROAST_DEFAULTS.aiTopP, 0.1, 1),
    variationMode: normalizedVariation,
    roastIntensity: normalizedRoastIntensity,
  }
}

/**
 * Converts roast text to line-based representation for UI typewriter rendering.
 */
export function toRoastLines(value: string): string[] {
  const lines = value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length > 0)
    return lines

  return [value.trim()].filter(Boolean)
}
