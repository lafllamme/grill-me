export type PatternKind = 'lines' | 'circles' | 'waves' | 'hexagons'

export function patternId(prefix: string, kind: PatternKind, id: string) {
  return `${prefix}-${kind}-${id}`
}
