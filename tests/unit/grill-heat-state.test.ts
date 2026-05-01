import { describe, expect, it } from 'vitest'
import { getGrillHeatState } from '../../app/utils/grill-heat-state'

describe('grill heat state', () => {
  it('maps low heat to a raw and dim state', () => {
    expect(getGrillHeatState(0)).toEqual({
      heat: 0,
      labels: {
        primary: 'Low',
        secondary: 'Raw edges',
      },
      meat: {
        color: 'rgb(217,132,110)',
        grillMarkOpacity: 0.08,
        roughness: 0.92,
        metalness: 0.02,
        wobble: 0.003,
      },
      coals: {
        color: 'rgb(75,25,15)',
        emissive: 'rgb(156,61,19)',
        emissiveIntensity: 0.18,
        pulse: 0.02,
      },
      fire: {
        color: 'rgb(255,143,58)',
        tipColor: 'rgb(255,167,92)',
        opacity: 0.12,
        intensity: 0.2,
        height: 0.18,
        flickerAmplitude: 0.03,
      },
      ambience: {
        color: 'rgb(44,23,15)',
        intensity: 0.32,
      },
    })
  })

  it('maps mid heat to a searing state', () => {
    const state = getGrillHeatState(0.5)

    expect(state.labels).toEqual({
      primary: 'High',
      secondary: 'Searing hard',
    })
    expect(state.meat.color).not.toBe('rgb(217,132,110)')
    expect(state.coals.emissiveIntensity).toBeGreaterThan(1)
    expect(state.fire.height).toBeGreaterThan(0.6)
  })

  it('maps max heat to the strongest char and fire output', () => {
    expect(getGrillHeatState(1)).toEqual({
      heat: 1,
      labels: {
        primary: 'Inferno',
        secondary: 'Char risk maximum',
      },
      meat: {
        color: 'rgb(42,23,18)',
        grillMarkOpacity: 0.72,
        roughness: 0.66,
        metalness: 0.08,
        wobble: 0.016,
      },
      coals: {
        color: 'rgb(255,106,26)',
        emissive: 'rgb(255,106,26)',
        emissiveIntensity: 2.8,
        pulse: 0.11,
      },
      fire: {
        color: 'rgb(255,224,138)',
        tipColor: 'rgb(255,220,135)',
        opacity: 0.82,
        intensity: 3.2,
        height: 1.15,
        flickerAmplitude: 0.22,
      },
      ambience: {
        color: 'rgb(184,77,26)',
        intensity: 1.25,
      },
    })
  })
})
