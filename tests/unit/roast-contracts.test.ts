import { describe, expect, it } from "vitest"
import {
  resolveRoastRuntimeOptions,
  roastRequestBodySchema,
  roastResponseSchema,
  roastStreamEventSchema,
  toRoastLines,
} from "../../shared/roast/contracts"

describe("roast contracts", () => {
  it("parses request body", () => {
    const parsed = roastRequestBodySchema.parse({ githubUsername: "lafllamme", debugLevel: "full" })

    expect(parsed.githubUsername).toBe("lafllamme")
    expect(parsed.debugLevel).toBe("full")
  })

  it("normalizes runtime options", () => {
    const runtime = resolveRoastRuntimeOptions(
      {
        roastDebug: "false",
        roastDebugLevel: "minimal",
        roastVariationMode: "moderate",
        githubTimeoutMs: "12000",
        cfAiTimeoutMs: "30000",
        cfAiMaxTokens: "240",
        cfAiTemperature: "0.55",
        cfAiTopP: "0.92",
      },
      { githubUsername: "lafllamme", includeDebug: false },
    )

    expect(runtime.debugLevel).toBe("minimal")
    expect(runtime.variationMode).toBe("moderate")
    expect(runtime.cfAiMaxTokens).toBe(2000)
  })

  it("validates roast response", () => {
    const parsed = roastResponseSchema.parse({
      username: "lafllamme",
      roastLines: ["line 1"],
      roast: "line 1",
      feedback: ["a", "b", "c"],
      meta: {
        commitCount: 4,
        prCount: 1,
      },
    })

    expect(parsed.roastLines).toHaveLength(1)
  })

  it("validates stream event union", () => {
    const parsed = roastStreamEventSchema.parse({
      type: "typing",
      chunk: "hello",
    })

    expect(parsed.type).toBe("typing")
  })

  it("splits roast text into lines", () => {
    expect(toRoastLines("a\n\nb")).toEqual(["a", "b"])
  })
})
