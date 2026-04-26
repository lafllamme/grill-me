// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/a11y',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@nuxt/scripts',
    '@unocss/nuxt',
  ],
  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      {
        name: 'Bricolage Grotesque',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700, 800],
        styles: ['normal'],
      },
      {
        name: 'DM Serif Display',
        provider: 'google',
        weights: [400],
        styles: ['normal', 'italic'],
      },
      {
        name: 'Outfit',
        provider: 'google',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ['normal'],
      },
      {
        name: 'Space Mono',
        provider: 'google',
        weights: [400, 700],
        styles: ['normal', 'italic'],
      },
    ],
  },
  runtimeConfig: {
    // Nuxt auto-maps these from:
    // NUXT_CF_ACCOUNT_ID, NUXT_CF_API_TOKEN, NUXT_CF_AI_MODEL, NUXT_GITHUB_TOKEN,
    // NUXT_GITHUB_TIMEOUT_MS, NUXT_CF_AI_TIMEOUT_MS, NUXT_CF_AI_MAX_TOKENS,
    // NUXT_CF_AI_TEMPERATURE, NUXT_CF_AI_TOP_P, NUXT_ROAST_DEBUG_LEVEL, NUXT_ROAST_VARIATION_MODE,
    // NUXT_DATABASE_URL, NUXT_ROAST_RECEIPT_SECRET
    cfAccountId: '',
    cfApiToken: '',
    cfAiModel: '@cf/qwen/qwen3-30b-a3b-fp8',
    githubTimeoutMs: '12000',
    cfAiTimeoutMs: '30000',
    cfAiMaxTokens: '2200',
    cfAiTemperature: '0.55',
    cfAiTopP: '0.92',
    roastDebug: 'false',
    roastDebugLevel: 'minimal',
    roastVariationMode: 'moderate',
    githubToken: '',
    databaseUrl: '',
    roastReceiptSecret: 'dev-roast-receipt-secret-change-me-in-prod',
    oauth: {
      github: {
        clientId: '',
        clientSecret: '',
      },
    },
  },
  experimental: {
    serverAppConfig: false,
  },
})
