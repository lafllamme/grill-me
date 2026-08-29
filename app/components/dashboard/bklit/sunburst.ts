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

const fullCircle = Math.PI * 2
const topAngle = -Math.PI / 2

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

export function buildHoverGeometry(arcs: readonly SunburstArc[], hoveredId: string | null, radius: number, hoverPop = 8): Map<string, SunburstHoverGeometry> {
  const targets = new Map<string, number>()
  const geometry = new Map<string, SunburstHoverGeometry>()
  if (!hoveredId) {
    return geometry
  }

  const hoveredArc = arcs.find(arc => arc.id === hoveredId)
  if (!hoveredArc) {
    return geometry
  }

  const grow = Math.min(hoverPop, radius * 0.1, (radius * 0.28) / Math.max(1, hoveredArc.depth))
  for (const arc of arcs) {
    if (!isOnHoverPath(arc, hoveredId)) {
      continue
    }

    targets.set(arc.id, grow)
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
