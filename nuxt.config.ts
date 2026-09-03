import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],

  modules: [
    'lenis/nuxt',
    '@nuxt/a11y',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@nuxt/scripts',
    '@tresjs/nuxt',
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
        global: true,
        preload: false,
        weights: [200, 300, 400, 500, 600, 700, 800],
        styles: ['normal'],
      },
      {
        name: 'General Sans',
        global: true,
        preload: true,
        weight: [200, 700],
        style: 'normal',
        src: [{ url: '/fonts/fontshare/general-sans/General-Sans__Variable.woff2', format: 'woff2' }],
      },
      {
        name: 'Azeret Mono',
        global: true,
        preload: true,
        weight: [100, 900],
        style: 'normal',
        src: [{ url: '/fonts/fontshare/azeret-mono/Azeret-Mono__Variable.woff2', format: 'woff2' }],
      },
      {
        name: 'Climate Crisis',
        global: true,
        preload: true,
        weight: 400,
        style: 'normal',
        src: [{ url: '/fonts/climate-crisis/Climate-Crisis__Variable.woff2', format: 'woff2' }],
      },
    ],
  },
  runtimeConfig: {
    // Nuxt auto-maps these from:
    // NUXT_CF_ACCOUNT_ID, NUXT_CF_API_TOKEN, NUXT_CF_AI_MODEL, NUXT_GITHUB_TOKEN,
    // NUXT_GITHUB_TIMEOUT_MS, NUXT_CF_AI_TIMEOUT_MS, NUXT_CF_AI_MAX_TOKENS,
    // NUXT_CF_AI_TEMPERATURE, NUXT_CF_AI_TOP_P, NUXT_ROAST_DEBUG, NUXT_ROAST_DEBUG_LEVEL, NUXT_ROAST_VARIATION_MODE,
    // NUXT_DASHBOARD_TRACE_LEVEL=off|summary|full,
    // NUXT_DASHBOARD_TRACE_FILE_DIR=logs/dashboard (empty disables file output),
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
    dashboardTraceLevel: process.env.NODE_ENV === 'production' ? 'off' : 'summary',
    dashboardTraceFileDir: process.env.NODE_ENV === 'production' ? '' : 'logs/dashboard',
    githubToken: '',
    databaseUrl: '',
    roastReceiptSecret: 'dev-roast-receipt-secret-change-me-in-prod',
    public: {
      // NUXT_PUBLIC_ROAST_DEBUG=true enables roast debug logs in browser.
      // NUXT_PUBLIC_DASHBOARD_TRACE_LEVEL=off|summary (full is server-only).
      roastDebug: 'false',
      dashboardTraceLevel: process.env.NODE_ENV === 'production' ? 'off' : 'summary',
    },
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
  vite: {
    optimizeDeps: {
      include: [
        '@tresjs/core',
        '@vueuse/core',
        'd3-shape',
        'motion-v',
        'ogl',
        'three',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/examples/jsm/loaders/GLTFLoader.js',
      ],
    },
  },
})
