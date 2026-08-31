import type { GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { consumeDashboardProfileSse } from '../../app/utils/dashboard-api'
import { toDashboardEvidence } from '../../server/roast/dashboard-profile-evidence'

describe('dashboard profile stream contract', () => {
  it('parses events when SSE blocks arrive across multiple chunks', async () => {
    const encoder = new TextEncoder()
    const chunks = [
      'event: meta\ndata: {"type":"meta","requestId":"abc123","username":"lafllamme"}\n\n',
      'event: status\ndata: {"type":"status","phase":"scoring","message":"Scoring"}\n\n',
      'event: done\ndata: {"type":"done","data":{"assessment":{},"evidence":{"commits":[],"pullRequests":[]}}}\n\n',
    ]
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(chunks[0]!.slice(0, 48)))
        controller.enqueue(encoder.encode(`${chunks[0]!.slice(48)}${chunks[1]}`))
        controller.enqueue(encoder.encode(chunks[2]!))
        controller.close()
      },
    })
    const events: string[] = []

    await consumeDashboardProfileSse(new Response(stream), event => events.push(event.type))

    expect(events).toEqual(['meta', 'status', 'done'])
  })

  it('keeps patch content server-side when shaping client evidence', () => {
    const context: GithubContext = {
      username: 'lafllamme',
      commits: [{
        repo: 'flame/grill-me',
        sha: 'abc123',
        message: 'feat: add stream',
        additions: 12,
        deletions: 2,
        changedFiles: 1,
        files: [{
          filename: 'server/stream.ts',
          status: 'modified',
          additions: 12,
          deletions: 2,
          patch: '+ sensitive implementation detail',
        }],
      }],
      prs: [],
    }

    const evidence = toDashboardEvidence(context)

    expect(evidence.commits[0]?.files[0]).toEqual({
      filename: 'server/stream.ts',
      status: 'modified',
      additions: 12,
      deletions: 2,
    })
    expect(evidence.commits[0]?.files[0]).not.toHaveProperty('patch')
  })
})
