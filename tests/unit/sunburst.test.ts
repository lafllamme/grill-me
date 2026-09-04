import { describe, expect, it } from 'vitest'
import { buildHoverGeometry, buildSunburstLayout, createSunburstPath, getBreadcrumbIds, getSunburstCenterRadius, getSunburstDisplayLabel, isDescendant } from '../../app/components/dashboard/bklit/sunburst'

describe('sunburst layout', () => {
  const data = {
    name: 'Repository',
    children: [
      { name: 'app', children: [{ name: 'components', value: 3 }, { name: 'pages', value: 2 }] },
      { name: 'server', value: 4 },
    ],
  } as const

  it('creates stable hierarchical arcs with summed parent values', () => {
    const layout = buildSunburstLayout(data)

    expect(layout.maxDepth).toBe(2)
    expect(layout.arcs.map(arc => arc.name)).toEqual(['app', 'components', 'pages', 'server'])
    expect(layout.arcs[0]?.value).toBe(5)
    expect(layout.arcs[0]?.parentId).toBe('Repository')
  })

  it('identifies hover paths and builds drill breadcrumbs', () => {
    const layout = buildSunburstLayout(data)
    const appId = layout.arcs[0]!.id
    const componentsId = layout.arcs[1]!.id

    expect(isDescendant(componentsId, appId)).toBe(true)
    expect(isDescendant(appId, componentsId)).toBe(false)
    expect(getBreadcrumbIds(componentsId, layout.nodes)).toEqual(['Repository', appId, componentsId])
  })

  it('does not render a stroked hairline before an arc enters', () => {
    const layout = buildSunburstLayout(data)

    expect(createSunburstPath(layout.arcs[0]!, 80, 0)).toBe('')
  })

  it('grows the hovered path and offsets descendants without moving unrelated rings', () => {
    const layout = buildSunburstLayout(data)
    const hoveredId = layout.arcs[0]!.id
    const geometry = buildHoverGeometry(layout.arcs, hoveredId, 80)

    expect(geometry.get(layout.arcs[0]!.id)).toEqual({ grow: 8, offset: 0 })
    expect(geometry.get(layout.arcs[1]!.id)).toEqual({ grow: 0, offset: 8 })
    expect(geometry.get(layout.arcs[2]!.id)).toEqual({ grow: 0, offset: 8 })
    expect(geometry.get(layout.arcs[3]!.id)).toBeUndefined()
  })

  it('shortens long labels to the available arc length', () => {
    expect(getSunburstDisplayLabel('DashboardExplorerLoadingGrid.vue', 80)).toMatch(/…$/)
    expect(getSunburstDisplayLabel('app', 80)).toBe('app')
    expect(getSunburstDisplayLabel('README.md', 20)).toBe('')
  })

  it('animates the drill-down center from the current focus state', () => {
    const layout = buildSunburstLayout(data)
    const appArc = layout.arcs[0]!

    expect(getSunburstCenterRadius(80, null, appArc, 0)).toBe(0)
    expect(getSunburstCenterRadius(80, null, appArc, 0.5)).toBe(26)
    expect(getSunburstCenterRadius(80, appArc, null, 1)).toBe(0)
  })
})
