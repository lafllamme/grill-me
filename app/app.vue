<template>
  <div class="text-orange-50 bg-black min-h-screen">
    <NuxtRouteAnnouncer />

    <div class="-z-0 pointer-events-none inset-0 fixed">
      <div class="inset-0 absolute from-orange-900/40 to-amber-900/25 via-black bg-gradient-to-br" />
      <div class="opacity-25 [background-size:36px_36px] [background:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] inset-0 absolute" />
    </div>

    <main class="mx-auto px-6 py-12 max-w-6xl relative z-10 md:py-16">
      <section class="mb-10 p-8 border border-orange-500/40 rounded-3xl bg-neutral-950/85 shadow-2xl md:p-12">
        <p class="text-xs text-orange-300 tracking-[0.2em] mb-4 px-4 py-1 border border-orange-400/40 rounded-full bg-orange-500/10 inline-flex gap-2 uppercase items-center">
          UnoCSS Check
        </p>
        <h1 class="text-4xl leading-tight tracking-tight font-black mb-4 md:text-6xl">
          Grill Me
          <span class="text-transparent block from-orange-300 to-amber-300 via-orange-500 bg-gradient-to-r bg-clip-text">
            Dark Ember Edition
          </span>
        </h1>
        <p class="text-sm text-orange-100/85 max-w-2xl md:text-base">
          Wenn du das hier mit Farben, Gradients, Spacing und Hover-Zuständen siehst, dann läuft
          deine UnoCSS/Tailwind-kompatible Konfiguration korrekt.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <button class="text-sm text-black font-semibold px-5 py-3 border border-orange-400 rounded-xl bg-orange-500 cursor-pointer shadow-lg transition hover:bg-orange-400 hover:-translate-y-0.5">
            Start Grilling
          </button>
          <button class="text-sm text-orange-50 font-semibold px-5 py-3 border border-white/25 rounded-xl bg-white/10 cursor-pointer transition backdrop-blur hover:border-orange-300/70 hover:bg-orange-500/15">
            Open Docs
          </button>
        </div>
      </section>

      <section class="gap-4 grid md:grid-cols-3">
        <article class="p-5 border border-orange-500/30 rounded-2xl bg-neutral-900/80 transition hover:border-orange-300/70">
          <p class="text-xs text-orange-300 tracking-[0.14em] mb-2 uppercase">
            Preset
          </p>
          <h2 class="text-xl text-orange-100 font-bold">
            Wind4 Active
          </h2>
          <p class="text-sm text-orange-100/80 mt-2">
            Tailwind-v4 Utility API ist aktiv und rendert korrekt.
          </p>
        </article>

        <article class="p-5 border border-orange-500/30 rounded-2xl bg-neutral-900/80 transition hover:border-orange-300/70">
          <p class="text-xs text-orange-300 tracking-[0.14em] mb-2 uppercase">
            Reset
          </p>
          <h2 class="text-xl text-orange-100 font-bold">
            Multi Reset Loaded
          </h2>
          <p class="text-sm text-orange-100/80 mt-2">
            Deine Main-CSS mit allen Reset-Imports wird eingebunden.
          </p>
        </article>

        <article class="p-5 border border-orange-500/30 rounded-2xl bg-neutral-900/80 transition hover:border-orange-300/70">
          <p class="text-xs text-orange-300 tracking-[0.14em] mb-2 uppercase">
            Module
          </p>
          <h2 class="text-xl text-orange-100 font-bold">
            @unocss/nuxt
          </h2>
          <p class="text-sm text-orange-100/80 mt-2">
            Nuxt-Modul injiziert UnoCSS erfolgreich in die App.
          </p>
        </article>
      </section>
    </main>
  </div>
</template>
