export interface SquareColumnLayout {
  count: number
  positions: number[]
  columnHeight: number
  squareSize: number
  gap: number
}

export interface SquareColumnInput {
  barLengthPx: number
  squareSize: number
  gap: number
  fit?: boolean
}

export function computeSquareColumn({ barLengthPx, squareSize, gap, fit = false }: SquareColumnInput): SquareColumnLayout {
  if (barLengthPx <= 0 || squareSize <= 0) {
    return { count: 0, positions: [], columnHeight: 0, squareSize, gap }
  }
  if (fit) {
    const count = Math.max(1, Math.floor((barLengthPx + gap) / (squareSize + gap)))
    const effectiveGap = count > 1 ? Math.max(0, (barLengthPx - count * squareSize) / (count - 1)) : 0
    const step = squareSize + effectiveGap
    return {
      count,
      positions: Array.from({ length: count }, (_, index) => barLengthPx - squareSize - index * step),
      columnHeight: barLengthPx,
      squareSize,
      gap: effectiveGap,
    }
  }
  const step = squareSize + gap
  const count = Math.max(1, Math.round(barLengthPx / step))
  const columnHeight = count * squareSize + Math.max(0, count - 1) * gap
  return {
    count,
    positions: Array.from({ length: count }, (_, index) => columnHeight - squareSize - index * step),
    columnHeight,
    squareSize,
    gap,
  }
}

export function topSquareCenterY(input: SquareColumnInput & { baselineY: number }): number {
  const layout = computeSquareColumn(input)
  return layout.count === 0 ? input.baselineY : input.baselineY - layout.columnHeight + layout.squareSize / 2
}
