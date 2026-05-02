import type { MeatModelConfig } from '../types'

export const sausageConfig: MeatModelConfig = {
  id: 'sausage',
  url: new URL('../../../assets/models/meat/Sausage.glb', import.meta.url).href,
  position: [0.34, 2.16, -0.14],
  rotation: [0.02, -0.18, -0.06],
  targetWidth: 0.92,
  modelScale: 1,
  phase: 0.5,
}

export const steakConfig: MeatModelConfig = {
  id: 'steak',
  url: new URL('../../../assets/models/meat/Steak.glb', import.meta.url).href,
  position: [0.82, 2.14, 0.12],
  rotation: [-0.03, 0.22, 0.08],
  targetWidth: 0.92,
  modelScale: 1,
  phase: 1.8,
}

export const baconConfig: MeatModelConfig = {
  id: 'bacon',
  url: new URL('../../../assets/models/meat/Bacon.glb', import.meta.url).href,
  position: [0.58, 2.13, -0.02],
  rotation: [0.01, 0.08, 0.02],
  targetWidth: 0.98,
  modelScale: 1,
  phase: 2.6,
}
