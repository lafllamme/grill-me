// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/a11y",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@unocss/nuxt",
  ],
  fonts: {
    defaults: {
      subsets: ["latin", "latin-ext"],
    },
    families: [
      {
        name: "Bricolage Grotesque",
        provider: "google",
        weights: [200, 300, 400, 500, 600, 700, 800],
        styles: ["normal"],
      },
      {
        name: "DM Serif Display",
        provider: "google",
        weights: [400],
        styles: ["normal", "italic"],
      },
      {
        name: "Outfit",
        provider: "google",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ["normal"],
      },
      {
        name: "Space Mono",
        provider: "google",
        weights: [400, 700],
        styles: ["normal", "italic"],
      },
    ],
  },
  experimental: {
    serverAppConfig: false,
  },
});
