import type { DashboardTraceLevel, DashboardTraceRender, DashboardTraceRenderHandler } from '~~/shared/dashboard/trace'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface DashboardTraceFileSinkOptions {
  directory?: string
  requestId: string
  username: string
  level: DashboardTraceLevel
}

export interface DashboardTraceFileSink {
  filePath: string
  onRender: DashboardTraceRenderHandler
}

function safeFilenameSegment(value: string): string {
  return value.replace(/[^\w-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') || 'dashboard'
}

function timestampSegment(date: Date): string {
  return date.toISOString().replace('T', '_').replace(/:/g, '-').replace(/\.\d{3}Z$/, '')
}

function markdownFence(value: string): string {
  const longestTildeRun = Math.max(0, ...[...value.matchAll(/~+/g)].map(match => match[0].length))
  const fence = '~'.repeat(Math.max(3, longestTildeRun + 1))
  return `${fence}text\n${value}\n${fence}`
}

function formatFileHeader(options: DashboardTraceFileSinkOptions, filePath: string): string {
  return [
    `# Dashboard trace — ${options.username}`,
    '',
    `- request: \`${options.requestId}\``,
    `- source: \`server\``,
    `- trace level: \`${options.level}\``,
    `- generated: ${new Date().toISOString()}`,
    `- file: \`${filePath}\``,
    '',
    '> This file is local diagnostic output. It is ignored by Git. In `summary` mode, prompt, patch, and model text are redacted to sizes.',
    '',
    '## Events',
    '',
  ].join('\n')
}

function formatRender(render: DashboardTraceRender, index: number): string {
  const { entry, event, text, boxes } = render
  const lines = [
    `### ${String(index).padStart(2, '0')} · ${event} · +${entry.elapsedMs}ms`,
    '',
    markdownFence(text),
  ]

  boxes.forEach((box, boxIndex) => {
    const title = event === 'prompt-prepared' ? 'AI prompt' : event === 'response-received' ? 'AI response' : `detail ${boxIndex + 1}`
    lines.push('', `#### ${title}`, '', markdownFence(box))
  })

  return `${lines.join('\n')}\n`
}

export function createDashboardTraceFileSink(options: DashboardTraceFileSinkOptions): DashboardTraceFileSink | undefined {
  if (!options.directory || options.level === 'off')
    return undefined

  const directory = resolve(options.directory)
  const filePath = resolve(directory, `${timestampSegment(new Date())}-${safeFilenameSegment(options.username)}-${safeFilenameSegment(options.requestId)}.md`)

  try {
    mkdirSync(directory, { recursive: true })
    writeFileSync(filePath, formatFileHeader(options, filePath), 'utf8')
  }
  catch {
    return undefined
  }

  let eventIndex = 0
  return {
    filePath,
    onRender: (render) => {
      try {
        eventIndex += 1
        appendFileSync(filePath, formatRender(render, eventIndex), 'utf8')
      }
      catch {
        // Trace persistence must never make an analysis request fail.
      }
    },
  }
}
