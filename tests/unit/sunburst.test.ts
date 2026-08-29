import { describe, expect, it } from 'vitest'
import { buildSunburstLayout, createSunburstPath, getBreadcrumbIds, isDescendant } from '../../app/components/dashboard/bklit/sunburst'

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
})
