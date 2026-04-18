import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'docs/**',
  ],
  nuxt: true,
  unocss: true,
  vue: true,
})
