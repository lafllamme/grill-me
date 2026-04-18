<template>
  <section class="mx-auto mt-10 p-8 border border-orange-500/35 rounded-3xl bg-neutral-950/85 max-w-6xl shadow-2xl md:p-10">
    <p class="text-xs text-orange-300 tracking-[0.2em] mb-4 uppercase">
      Docs Hub
    </p>
    <h1 class="text-3xl text-orange-100 font-black mb-3 md:text-4xl">
      Project Documentation
    </h1>
    <p class="text-sm text-orange-100/80 max-w-3xl md:text-base">
      Zentrale Navigation für interne App-Routen und externe Referenzen (Nuxt / UnoCSS).
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <NuxtLink
        class="text-sm text-black font-semibold px-4 py-2 border border-orange-400 rounded-xl bg-orange-500 transition hover:bg-orange-400"
        to="/"
      >
        Back Home
      </NuxtLink>
      <NuxtLink
        class="text-sm text-orange-100 font-semibold px-4 py-2 border border-orange-400/40 rounded-xl bg-black transition hover:bg-orange-500/15"
        to="/#wall-of-shame"
      >
        Wall of Shame
      </NuxtLink>
      <NuxtLink
        class="text-sm text-orange-100 font-semibold px-4 py-2 border border-orange-400/40 rounded-xl bg-black transition hover:bg-orange-500/15"
        to="/#metrics"
      >
        Metrics
      </NuxtLink>
    </div>

    <div class="mt-8 gap-4 grid md:grid-cols-2">
      <article class="p-5 border border-orange-500/30 rounded-2xl bg-neutral-900/80">
        <p class="text-xs text-orange-300 tracking-[0.14em] mb-2 uppercase">
          Internal
        </p>
        <ul class="text-sm space-y-2">
          <li>
            <NuxtLink class="text-orange-100 underline-offset-4 hover:text-orange-200 hover:underline" to="/">
              / (Home)
            </NuxtLink>
          </li>
          <li>
            <NuxtLink class="text-orange-100 underline-offset-4 hover:text-orange-200 hover:underline" to="/docs">
              /docs (this page)
            </NuxtLink>
          </li>
        </ul>
      </article>

      <article id="api" class="p-5 border border-orange-500/30 rounded-2xl bg-neutral-900/80">
        <p class="text-xs text-orange-300 tracking-[0.14em] mb-2 uppercase">
          API
        </p>
        <ul class="text-sm space-y-2">
          <li>
            <a class="text-orange-100 underline-offset-4 hover:text-orange-200 hover:underline" href="https://nuxt.com/docs" rel="noreferrer" target="_blank">
              Nuxt Docs
            </a>
          </li>
          <li>
            <a class="text-orange-100 underline-offset-4 hover:text-orange-200 hover:underline" href="https://unocss.dev/" rel="noreferrer" target="_blank">
              UnoCSS Docs
            </a>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
