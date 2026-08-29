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

  const visit = (node: SunburstNode, id: string, parentId: string | null, depth: number, startAngle: number, endAngle: number) => {
    nodes.set(id, node)
    maxDepth = Math.max(maxDepth, depth)
    if (depth > 0) {
      arcs.push({
        id,
        parentId,
        name: node.name,
        depth,
        value: nodeValue(node),
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
      const childId = id ? `${id} / ${child.name}-${index}` : `${child.name}-${index}`
      visit(child, childId, id || null, depth + 1, cursor, cursor + childSpan)
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

export function createSunburstPath(arc: SunburstArc, radius: number, progress = 1, grow = 0, offset = 0): string {
  const span = Math.max(0.002, arc.endAngle - arc.startAngle)
  const endAngle = arc.startAngle + span * Math.min(1, Math.max(0, progress))
  const innerRadius = Math.max(0, (arc.depth - 1) * radius + 3)
  const outerRadius = arc.depth * radius + grow
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
  const palette = ['var(--color-primary)', 'var(--color-primary-strong)', '#d8bfa8', '#8b7cf6', '#ef4444']
  return palette[index % palette.length] ?? 'var(--color-primary)'
}
