import { z } from "zod"

/**
 * GitHub username constraints from GitHub docs:
 * - 1-39 chars
 * - alphanumeric or single hyphen segments
 */
export const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

/**
 * Hard limits for upstream data collection and model payload size.
 */
export const ROAST_LIMITS = {
  eventsPerPage: 100,
  maxCommitRefs: 8,
  maxPrs: 6,
  maxFilesPerCommit: 4,
  maxPatchChars: 700,
  maxResponsePreviewChars: 1000,
  maxRoastWords: 220,
  minFeedbackItems: 3,
  maxFeedbackItems: 5,
} as const

/**
 * Runtime defaults used if env values are missing/invalid.
 */
export const ROAST_DEFAULTS = {
  rateLimitWindowMs: 60_000,
  rateLimitMax: 8,
  githubTimeoutMs: 12_000,
  aiTimeoutMs: 25_000,
  aiMaxTokens: 240,
} as const

export const roastRequestBodySchema = z.object({
  githubUsername: z.string().trim().min(1),
  includeDebug: z.union([z.boolean(), z.string(), z.number()]).optional(),
})

export type RoastRequestBody = z.infer<typeof roastRequestBodySchema>

export const roastMetaSchema = z.object({
  commitCount: z.number().int().nonnegative(),
  prCount: z.number().int().nonnegative(),
})

export type RoastMeta = z.infer<typeof roastMetaSchema>

export const debugRequestInfoSchema = z.object({
  stage: z.enum(["github_profile", "github_events", "github_commit", "cloudflare_ai"]),
  url: z.string(),
  durationMs: z.number().nonnegative(),
  ok: z.boolean(),
  statusCode: z.number().int().optional(),
})

export type DebugRequestInfo = z.infer<typeof debugRequestInfoSchema>

export const roastDebugSchema = z.object({
  username: z.string(),
  timingsMs: z.object({
    githubFetch: z.number().optional(),
    aiGenerate: z.number().optional(),
    total: z.number().optional(),
  }),
  github: z.record(z.string(), z.unknown()).optional(),
  ai: z.record(z.string(), z.unknown()).optional(),
  requests: z.array(debugRequestInfoSchema),
})

export type RoastDebug = z.infer<typeof roastDebugSchema>

export const roastResponseSchema = z.object({
  username: z.string(),
  roast: z.string(),
  feedback: z.array(z.string()),
  meta: roastMetaSchema,
  debug: roastDebugSchema.optional(),
})

export type RoastResponse = z.infer<typeof roastResponseSchema>

export interface RoastRuntimeOptions {
  includeDebug: boolean
  githubTimeoutMs: number
  cfAiTimeoutMs: number
  cfAiMaxTokens: number
}

/**
 * Parses common truthy values from payload/env.
 */
export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean")
    return value

  if (typeof value === "string")
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())

  if (typeof value === "number")
    return value === 1

  return false
}

/**
 * Parses a positive number from unknown input with safe fallback.
 */
export const parsePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Builds normalized runtime options from Nuxt runtime config + request payload.
 */
export const resolveRoastRuntimeOptions = (config: Record<string, unknown>, includeDebugInput: unknown): RoastRuntimeOptions => {
  return {
    includeDebug: parseBoolean(includeDebugInput) || parseBoolean(config.roastDebug),
    githubTimeoutMs: parsePositiveNumber(config.githubTimeoutMs, ROAST_DEFAULTS.githubTimeoutMs),
    cfAiTimeoutMs: parsePositiveNumber(config.cfAiTimeoutMs, ROAST_DEFAULTS.aiTimeoutMs),
    cfAiMaxTokens: parsePositiveNumber(config.cfAiMaxTokens, ROAST_DEFAULTS.aiMaxTokens),
  }
}

