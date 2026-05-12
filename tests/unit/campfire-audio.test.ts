import { describe, expect, it, vi } from 'vitest'
import { createCampfireAudioPlayer } from '../../app/utils/campfire-audio'

describe('campfire audio player', () => {
  it('lazy-loads source only when play is called and reuses a single audio instance', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    const loadSource = vi.fn().mockResolvedValue('/audio/campfire.mp3')
    const createAudio = vi.fn().mockImplementation(() => ({
      loop: false,
      preload: 'none',
      volume: 0,
      play,
    }))

    const player = createCampfireAudioPlayer({
      createAudio: createAudio as unknown as (source: string) => HTMLAudioElement,
      loadSource,
      getIsClient: () => true,
      volume: 0.2,
    })

    expect(loadSource).not.toHaveBeenCalled()

    await player.play()
    await player.play()

    expect(loadSource).toHaveBeenCalledTimes(1)
    expect(createAudio).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(2)
  })

  it('does nothing outside client execution', async () => {
    const loadSource = vi.fn().mockResolvedValue('/audio/campfire.mp3')
    const createAudio = vi.fn()

    const player = createCampfireAudioPlayer({
      createAudio: createAudio as unknown as (source: string) => HTMLAudioElement,
      loadSource,
      getIsClient: () => false,
    })

    await player.play()

    expect(loadSource).not.toHaveBeenCalled()
    expect(createAudio).not.toHaveBeenCalled()
  })

  it('swallows play failures and does not throw', async () => {
    const loadSource = vi.fn().mockResolvedValue('/audio/campfire.mp3')
    const createAudio = vi.fn().mockImplementation(() => ({
      loop: false,
      preload: 'none',
      volume: 0,
      play: vi.fn().mockRejectedValue(new Error('blocked')),
    }))

    const player = createCampfireAudioPlayer({
      createAudio: createAudio as unknown as (source: string) => HTMLAudioElement,
      loadSource,
      getIsClient: () => true,
    })

    await expect(player.play()).resolves.toBeUndefined()
    expect(loadSource).toHaveBeenCalledTimes(1)
  })

  it('guards concurrent play calls behind one source load', async () => {
    let resolveSource: ((value: string) => void) | null = null
    const loadSource = vi.fn().mockImplementation(() => {
      return new Promise<string>((resolve) => {
        resolveSource = resolve
      })
    })

    const play = vi.fn().mockResolvedValue(undefined)
    const createAudio = vi.fn().mockImplementation(() => ({
      loop: false,
      preload: 'none',
      volume: 0,
      play,
    }))

    const player = createCampfireAudioPlayer({
      createAudio: createAudio as unknown as (source: string) => HTMLAudioElement,
      loadSource,
      getIsClient: () => true,
    })

    const firstPlay = player.play()
    const secondPlay = player.play()

    expect(loadSource).toHaveBeenCalledTimes(1)
    resolveSource?.('/audio/campfire.mp3')

    await Promise.all([firstPlay, secondPlay])
    expect(createAudio).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(2)
  })
})
