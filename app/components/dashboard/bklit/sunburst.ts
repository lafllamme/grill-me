import { arc as createArc } from 'd3-shape'

export interface SunburstNode {
  name: string
  value?: number
  color?: string
  children?: readonly SunburstNode[]
}

export interface SunburstArc {
  id: string
  parentId: string | null
  name: string
  depth: number
  value: number
  categoryIndex: number
  color?: string
  startAngle: number
  endAngle: number
  arcIndex: number
  hasChildren: boolean
}

export interface SunburstLayout {
  arcs: SunburstArc[]
  nodes: Map<string, SunburstNode>
  rootId: string
  maxDepth: number
}

export interface SunburstHoverGeometry {
  grow: number
  offset: number
}

export interface SunburstGeometry {
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
}

const hoverGrowRingBudget = 0.28
const hoverGrowSegmentCap = 0.1
const drilldownCenterScale = 0.65
const sunburstLabelCharacterWidth = 6.5
const sunburstLabelGutter = 10
const minimumSunburstLabelCharacters = 4

const fullCircle = Math.PI * 2
const topAngle = -Math.PI / 2

export function getSunburstDisplayLabel(name: string, availableLength: number): string {
  const maximumCharacters = Math.floor(Math.max(0, availableLength - sunburstLabelGutter) / sunburstLabelCharacterWidth)
  if (maximumCharacters < minimumSunburstLabelCharacters) {
    return ''
  }
  if (name.length <= maximumCharacters) {
    return name
  }
  return `${name.slice(0, maximumCharacters - 1)}…`
}

export function getSunburstCenterRadius(radius: number, fromFocusArc: SunburstArc | null, toFocusArc: SunburstArc | null, progress: number): number {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const fromRadius = fromFocusArc?.depth ? radius * drilldownCenterScale : 0
  const toRadius = toFocusArc?.depth ? radius * drilldownCenterScale : 0
  return fromRadius + (toRadius - fromRadius) * clampedProgress
}

function nodeValue(node: SunburstNode): number {
  if (node.children?.length) {
    return node.children.reduce((total, child) => total + nodeValue(child), 0)
  }
  return Math.max(0, node.value ?? 0)
}

export function buildSunburstLayout(root: SunburstNode): SunburstLayout {
  const arcs: SunburstArc[] = []
  const nodes = new Map<string, SunburstNode>()
  let maxDepth = 0

  const visit = (node: SunburstNode, id: string, parentId: string | null, depth: number, startAngle: number, endAngle: number, categoryIndex = 0) => {
    nodes.set(id, node)
    maxDepth = Math.max(maxDepth, depth)
    if (depth > 0) {
      arcs.push({
        id,
        parentId,
        name: node.name,
        depth,
        value: nodeValue(node),
        categoryIndex,
        color: node.color,
        startAngle,
        endAngle,
        arcIndex: arcs.length,
        hasChildren: Boolean(node.children?.length),
      })
    }

    const children = node.children ?? []
    const total = children.reduce((sum, child) => sum + nodeValue(child), 0)
    if (!total)
      return
    let cursor = startAngle
    children.forEach((child, index) => {
      const childSpan = (nodeValue(child) / total) * (endAngle - startAngle)
      const childId = id ? `${id} / ${child.name}` : child.name
      visit(child, childId, id || null, depth + 1, cursor, cursor + childSpan, depth === 0 ? index : categoryIndex)
      cursor += childSpan
    })
  }

  const rootId = root.name
  visit(root, rootId, null, 0, topAngle, topAngle + fullCircle)
  return { arcs, nodes, rootId, maxDepth }
}

export function isDescendant(id: string, ancestorId: string): boolean {
  return id === ancestorId || id.startsWith(`${ancestorId} / `)
}

function isOnHoverPath(arc: SunburstArc, hoveredId: string): boolean {
  return arc.id === hoveredId || hoveredId.startsWith(`${arc.id} / `)
}

export function maxHoverSegmentThickness(maxDepth: number, radius: number, hoverPop = 8): number {
  const totalRadius = maxDepth * radius
  const referenceRingWidth = (totalRadius - radius * 0.65) / Math.max(1, maxDepth - 1)
  const grow = Math.min(
    hoverPop,
    referenceRingWidth * hoverGrowSegmentCap,
    referenceRingWidth * hoverGrowRingBudget,
  )
  return referenceRingWidth + grow
}

export function buildHoverGeometry(arcs: readonly SunburstArc[], hoveredId: string | null, radius: number, maxDepth = Math.max(1, ...arcs.map(arc => arc.depth)), focusId: string | null = null, hoverPop = 8): Map<string, SunburstHoverGeometry> {
  const geometry = new Map<string, SunburstHoverGeometry>()
  if (!hoveredId) {
    return geometry
  }

  const hoveredArc = arcs.find(arc => arc.id === hoveredId)
  if (!hoveredArc) {
    return geometry
  }

  const focusDepth = focusId ? (arcs.find(arc => arc.id === focusId)?.depth ?? 0) : 0
  const visibleRingCount = Math.max(1, maxDepth - focusDepth)
  const totalRadius = maxDepth * radius
  const centerRadius = focusDepth === 0 ? 0 : radius * drilldownCenterScale
  const ringWidth = (totalRadius - centerRadius) / visibleRingCount
  const pathLength = Math.max(1, hoveredArc.depth - focusDepth)
  const grow = Math.min(
    hoverPop,
    ringWidth * hoverGrowSegmentCap,
    (ringWidth * hoverGrowRingBudget) / pathLength,
  )
  const maxExpandedThickness = maxHoverSegmentThickness(maxDepth, radius, hoverPop)
  const isVisible = (arc: SunburstArc) => arc.depth > focusDepth && (!focusId || isDescendant(arc.id, focusId))
  const targets = new Map<string, number>()

  for (const arc of arcs) {
    if (!isOnHoverPath(arc, hoveredId) || !isVisible(arc)) {
      continue
    }
    const baseThickness = ringWidth
    const allowedGrow = baseThickness >= maxExpandedThickness
      ? 0
      : Math.min(grow, maxExpandedThickness - baseThickness)
    targets.set(arc.id, allowedGrow)
  }

  const arcsById = new Map(arcs.map(arc => [arc.id, arc]))
  for (const arc of arcs) {
    const ownGrow = targets.get(arc.id) ?? 0
    let offset = 0
    let parentId = arc.parentId
    while (parentId) {
      offset += targets.get(parentId) ?? 0
      parentId = arcsById.get(parentId)?.parentId ?? null
    }
    if (ownGrow || offset) {
      geometry.set(arc.id, { grow: ownGrow, offset })
    }
  }

  return geometry
}

export function getBreadcrumbIds(focusId: string, nodes: Map<string, SunburstNode>): string[] {
  const ids = [focusId]
  let current = focusId
  while (current.includes(' / ')) {
    current = current.slice(0, current.lastIndexOf(' / '))
    ids.unshift(current)
  }
  if (!nodes.has(ids[0]!)) {
    ids.unshift(focusId)
  }
  return ids
}

function interpolateAngle(from: number, to: number, progress: number) {
  let delta = to - from
  while (delta > Math.PI) delta -= fullCircle
  while (delta < -Math.PI) delta += fullCircle
  return from + delta * progress
}

function interpolateGeometry(from: SunburstGeometry, to: SunburstGeometry, progress: number): SunburstGeometry {
  const t = Math.max(0, Math.min(1, progress))
  const fromMid = (from.startAngle + from.endAngle) / 2
  const toMid = (to.startAngle + to.endAngle) / 2
  const fromHalf = (from.endAngle - from.startAngle) / 2
  const toHalf = (to.endAngle - to.startAngle) / 2
  const mid = interpolateAngle(fromMid, toMid, t)
  const half = fromHalf + (toHalf - fromHalf) * t
  return {
    startAngle: mid - half,
    endAngle: mid + half,
    innerRadius: from.innerRadius + (to.innerRadius - from.innerRadius) * t,
    outerRadius: from.outerRadius + (to.outerRadius - from.outerRadius) * t,
  }
}

function pointGeometry(geometry: SunburstGeometry): SunburstGeometry {
  const mid = (geometry.startAngle + geometry.endAngle) / 2
  const pointRadius = Math.max(0, Math.min((geometry.innerRadius + geometry.outerRadius) / 2 * 0.12, geometry.innerRadius))
  return { startAngle: mid, endAngle: mid, innerRadius: pointRadius, outerRadius: pointRadius }
}

export function getSunburstGeometry(arc: SunburstArc, focusArc: SunburstArc | null, maxDepth: number, radius: number): SunburstGeometry | null {
  const focusDepth = focusArc?.depth ?? 0
  if (arc.depth <= focusDepth || (focusArc && !isDescendant(arc.id, focusArc.id))) {
    return null
  }
  const totalRadius = maxDepth * radius
  const centerRadius = focusDepth === 0 ? 0 : radius * drilldownCenterScale
  const ringCount = Math.max(1, maxDepth - focusDepth)
  const ringWidth = (totalRadius - centerRadius) / ringCount
  const focusStart = focusArc?.startAngle ?? topAngle
  const focusSpan = (focusArc?.endAngle ?? (topAngle + fullCircle)) - focusStart
  const mapAngle = (angle: number) => topAngle + ((angle - focusStart) / Math.max(focusSpan, 1e-9)) * fullCircle
  const relativeDepth = arc.depth - focusDepth
  return {
    startAngle: mapAngle(arc.startAngle),
    endAngle: mapAngle(arc.endAngle),
    innerRadius: centerRadius + (relativeDepth - 1) * ringWidth,
    outerRadius: centerRadius + relativeDepth * ringWidth,
  }
}

export function transitionSunburstGeometry(arc: SunburstArc, fromFocusArc: SunburstArc | null, toFocusArc: SunburstArc | null, maxDepth: number, radius: number, progress: number): SunburstGeometry | null {
  const from = getSunburstGeometry(arc, fromFocusArc, maxDepth, radius)
  const to = getSunburstGeometry(arc, toFocusArc, maxDepth, radius)
  if (from && to) {
    return interpolateGeometry(from, to, progress)
  }
  if (from) {
    return interpolateGeometry(from, pointGeometry(from), progress)
  }
  if (to) {
    return interpolateGeometry(pointGeometry(to), to, progress)
  }
  return null
}

export function createSunburstGeometryPath(geometry: SunburstGeometry, progress = 1, grow = 0, radialOffset = 0): string {
  const span = geometry.endAngle - geometry.startAngle
  const visibleSpan = span * Math.min(1, Math.max(0, progress))
  if (visibleSpan <= 0.001) {
    return ''
  }
  return createArc<{ innerRadius: number, outerRadius: number, startAngle: number, endAngle: number }>()({
    innerRadius: Math.max(0, geometry.innerRadius + radialOffset),
    outerRadius: geometry.outerRadius + grow + radialOffset,
    startAngle: geometry.startAngle,
    endAngle: geometry.startAngle + visibleSpan,
  }) ?? ''
}

export function createSunburstPath(arc: SunburstArc, radius: number, progress = 1, grow = 0, offset = 0, radialOffset = 0): string {
  const span = arc.endAngle - arc.startAngle
  const visibleSpan = span * Math.min(1, Math.max(0, progress))
  // Do not stroke a zero-progress arc. A tiny forced wedge renders as a set of
  // radial hairlines before the segment body has entered.
  if (visibleSpan <= 0.001) {
    return ''
  }
  const endAngle = arc.startAngle + visibleSpan
  const innerRadius = Math.max(0, (arc.depth - 1) * radius + 3 + radialOffset)
  const outerRadius = arc.depth * radius + grow + radialOffset
  return createArc<{
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
  }>()({
    innerRadius,
    outerRadius,
    startAngle: arc.startAngle + offset,
    endAngle: endAngle + offset,
  }) ?? ''
}

export function getSegmentColor(arc: SunburstArc, index: number): string {
  if (arc.color)
    return arc.color
  const palette = [
    'var(--chart-1, var(--color-primary-strong))',
    'var(--chart-2, var(--color-primary))',
    'var(--chart-3, var(--color-primary-strong))',
    'var(--chart-4, var(--color-primary))',
    'var(--chart-5, var(--color-primary))',
  ]
  return palette[arc.categoryIndex % palette.length] ?? palette[index % palette.length] ?? 'var(--color-primary)'
}
