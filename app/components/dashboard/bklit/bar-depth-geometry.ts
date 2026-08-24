export const BAR_DEPTH_MAX_PX = 7
export const BAR_DEPTH_PERSPECTIVE_RATIO = 0.45

export function barDepthMaxDepth(stepWidth: number, bandWidth: number): number {
  const gap = Math.max(0, stepWidth - bandWidth)
  return Math.min(bandWidth * 0.22, Math.max(0, gap - 1), BAR_DEPTH_MAX_PX)
}

export function barDepthAndRise(absOffset: number, naturalHeight: number, maxDepth: number) {
  const offset = Math.min(1, Math.max(0, absOffset))
  const depth = offset * Math.min(maxDepth, Math.max(0, naturalHeight))
  return { depth, perspectiveRise: depth * BAR_DEPTH_PERSPECTIVE_RATIO }
}
