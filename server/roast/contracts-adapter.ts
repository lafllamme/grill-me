import type { RoastRequestBody, RoastRuntimeOptions, RoastStreamRequestBody } from '~~/shared/roast/contracts'
import { createError, readBody } from 'h3'
import {
  GITHUB_USERNAME_REGEX,
  resolveRoastRuntimeOptions,

  roastRequestBodySchema,

  roastStreamRequestBodySchema,
} from '~~/shared/roast/contracts'

/**
 * Canonical parsed request for roast endpoints.
 */
export interface ParsedRoastRequest {
  username: string
  body: RoastRequestBody | RoastStreamRequestBody
  runtime: RoastRuntimeOptions
}

/**
 * Validates and normalizes a GitHub username.
 */
export function validateGithubUsername(value: string): string {
  const trimmed = value.trim().replace(/^@/, '')
  if (!GITHUB_USERNAME_REGEX.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid GitHub username',
      data: {
        code: 'invalid_username',
      },
    })
  }

  return trimmed
}

/**
 * Parses body and runtime options for the sync endpoint.
 */
export async function parseRoastRequest(event: Parameters<typeof readBody>[0]): Promise<ParsedRoastRequest> {
  const rawBody = await readBody(event)
  const parsedBody = roastRequestBodySchema.safeParse(rawBody)
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'githubUsername is required',
      data: {
        code: 'invalid_request',
        issues: parsedBody.error.issues,
      },
    })
  }

  const config = useRuntimeConfig(event) as Record<string, unknown>
  const username = validateGithubUsername(parsedBody.data.githubUsername)
  const runtime = resolveRoastRuntimeOptions(config, parsedBody.data)

  return {
    username,
    body: parsedBody.data,
    runtime,
  }
}

/**
 * Parses body and runtime options for the stream endpoint.
 */
export async function parseRoastStreamRequest(event: Parameters<typeof readBody>[0]): Promise<ParsedRoastRequest> {
  const rawBody = await readBody(event)
  const parsedBody = roastStreamRequestBodySchema.safeParse(rawBody)
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'githubUsername is required',
      data: {
        code: 'invalid_request',
        issues: parsedBody.error.issues,
      },
    })
  }

  const config = useRuntimeConfig(event) as Record<string, unknown>
  const username = validateGithubUsername(parsedBody.data.githubUsername)
  const runtime = resolveRoastRuntimeOptions(config, parsedBody.data)

  return {
    username,
    body: parsedBody.data,
    runtime,
  }
}
