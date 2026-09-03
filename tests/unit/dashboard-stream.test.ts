import type { GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { consumeDashboardProfileSse } from '../../app/utils/dashboard-api'
import { toDashboardEvidence } from '../../server/roast/dashboard/evidence'

describe('dashboard profile stream contract', () => {
  it('parses events when SSE blocks arrive across multiple chunks', async () => {
    const encoder = new TextEncoder()
    const chunks = [
      'event: meta\ndata: {"type":"meta","requestId":"abc123","username":"lafllamme"}\n\n',
      'event: github_progress\ndata: {"type":"github_progress","phase":"commits","message":"Commit evidence is ready for scoring.","counts":{"repositories":1,"candidateCommits":12,"enrichedCommits":12,"usablePatches":4,"associatedPullRequests":0,"checkSummaries":0}}\n\n',
      'event: status\ndata: {"type":"status","phase":"scoring","message":"Scoring"}\n\n',
      'event: done\ndata: {"type":"done","data":{"assessment":{},"evidence":{"commits":[],"pullRequests":[]}}}\n\n',
    ]
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(chunks[0]!.slice(0, 48)))
        controller.enqueue(encoder.encode(`${chunks[0]!.slice(48)}${chunks[1]}`))
        controller.enqueue(encoder.encode(chunks[2]!))
        controller.enqueue(encoder.encode(chunks[3]!))
        controller.close()
      },
    })
    const events: string[] = []

    await consumeDashboardProfileSse(new Response(stream), event => events.push(event.type))

    expect(events).toEqual(['meta', 'github_progress', 'status', 'done'])
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

  it('keeps the internal sampling ledger out of the public evidence contract', () => {
    const evidence = toDashboardEvidence({
      username: 'torvalds',
      commits: [],
      prs: [],
      sampling: {
        candidateRefs: 30,
        integrationSkipped: 18,
        personalRefs: 12,
        detailsFetched: 16,
        personalWithPatch: 12,
        backfilled: 12,
        evidenceState: 'expanded-window',
        perRepository: {},
      },
    })

    expect(evidence).not.toHaveProperty('sampling')
  })
})
