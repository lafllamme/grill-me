interface CampfireAudioOptions {
  createAudio?: (source: string) => HTMLAudioElement
  loadSource?: () => Promise<string>
  getIsClient?: () => boolean
  volume?: number
}

interface CampfireAudioPlayer {
  play: () => Promise<void>
  releaseHandle: () => void
}

const DEFAULT_VOLUME = 0.8

async function defaultLoadSource(): Promise<string> {
  const sourceModule = await import('~/assets/audio/campfire.mp3')
  return sourceModule.default
}

function defaultCreateAudio(source: string): HTMLAudioElement {
  const audio = new Audio(source)
  audio.loop = true
  audio.preload = 'auto'
  return audio
}

export function createCampfireAudioPlayer(options: CampfireAudioOptions = {}): CampfireAudioPlayer {
  const createAudio = options.createAudio ?? defaultCreateAudio
  const loadSource = options.loadSource ?? defaultLoadSource
  const getIsClient = options.getIsClient ?? (() => import.meta.client)
  const volume = options.volume ?? DEFAULT_VOLUME

  let audio: HTMLAudioElement | null = null
  let loadPromise: Promise<HTMLAudioElement | null> | null = null

  const initializeAudio = async (): Promise<HTMLAudioElement | null> => {
    if (!getIsClient())
      return null

    if (audio)
      return audio

    const source = await loadSource()
    const initializedAudio = createAudio(source)
    initializedAudio.loop = true
    initializedAudio.preload = 'auto'
    initializedAudio.volume = volume

    audio = initializedAudio
    return audio
  }

  const ensureAudio = async (): Promise<HTMLAudioElement | null> => {
    if (audio)
      return audio

    if (!loadPromise)
      loadPromise = initializeAudio()

    const initializedAudio = await loadPromise
    loadPromise = null
    return initializedAudio
  }

  const play = async (): Promise<void> => {
    const currentAudio = await ensureAudio()
    if (!currentAudio)
      return

    try {
      await currentAudio.play()
    }
    catch {}
  }

  const releaseHandle = (): void => {
    audio = null
    loadPromise = null
  }

  return {
    play,
    releaseHandle,
  }
}
