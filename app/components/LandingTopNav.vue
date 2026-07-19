<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed, ref } from 'vue'
import { NuxtLink } from '#components'
import { useRoute } from '#imports'
import GrillmeLogo from '~/components/GrillmeLogo.vue'
import { useAuthSession } from '~/composables/useAuthSession'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'signal'
}>(), {
  variant: 'default',
})

const isMobileMenuOpen = ref(false)
const { loggedIn, user, login, logout } = useAuthSession()
const route = useRoute()
const isSignalVariant = computed(() => props.variant === 'signal')
const logoAccent = computed(() => isSignalVariant.value ? '#F0444D' : '#FF5633')
const navigationHoverClass = computed(() => isSignalVariant.value ? 'hover:bg-signal-red-500/16' : 'hover:bg-[rgba(255,86,51,0.16)]')
const primaryButtonClass = computed(() => isSignalVariant.value
  ? 'bg-signal-red-700 active:bg-signal-red-900 hover:bg-signal-red-600'
  : 'bg-ember-600 active:bg-ember-800 hover:bg-ember-700')
const signalTextClass = computed(() => isSignalVariant.value ? 'text-signal-red-400' : 'text-primary')
const signalBorderClass = computed(() => isSignalVariant.value ? 'border-signal-red-500/30' : 'border-primary/30')

const mobileMenuItems = [
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Wall of Shame', to: '/#wall-of-shame' },
  { label: 'Metrics', to: '/#metrics' },
  { label: 'API', to: '/docs#api' },
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

const mobileMenuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const mobileMenuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

async function handleLogin() {
  await login()
}

async function handleLogout() {
  await logout()
}

const authFeedback = computed(() => {
  const authState = typeof route.query.auth === 'string' ? route.query.auth : ''
  if (authState === 'github_failed')
    return 'GitHub login failed. Please try again.'
  if (authState === 'github_not_configured')
    return 'GitHub OAuth is not configured. Set NUXT_OAUTH_GITHUB_CLIENT_ID and NUXT_OAUTH_GITHUB_CLIENT_SECRET.'
  if (authState === 'github_session_failed')
    return 'GitHub login succeeded, but session setup failed. Check NUXT_SESSION_PASSWORD.'
  if (authState === 'github_invalid_profile')
    return 'GitHub account data was incomplete. Please retry.'
  return ''
})
</script>

<template>
  <header class="pt-4 bg-transparent h-fit w-full fixed z-[999999] md:top-0">
    <aside class="px-4 lg:px-0 md:px-12">
      <p
        v-if="authFeedback"
        class="text-xs tracking-[0.08em] font-meta mb-2 px-4 py-2 border-[1px] rounded-md border-solid bg-black/40 md:px-6"
        :class="[signalTextClass, signalBorderClass]"
      >
        {{ authFeedback }}
      </p>
      <nav class="supports-backdrop-filter:backdrop-blur-md mx-auto py-2 pl-2 pr-2 border border-[lab(100%_0_0_/_0.1)] rounded-[14px] border-solid bg-[rgba(38,38,38,0.07)] max-w-5xl w-full hidden items-center justify-between z-50 backdrop-blur-md lg:py-1.5 lg:pl-2.5 lg:pr-2.5 lg:flex">
        <NuxtLink to="/">
          <div class="h-9 w-28 relative">
            <GrillmeLogo class="h-full w-full" :accent="logoAccent" />
          </div>
        </NuxtLink>

        <div class="inline-flex items-center">
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center" :class="navigationHoverClass" to="/leaderboard">
            Leaderboard
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center" :class="navigationHoverClass" to="/#wall-of-shame">
            Wall of Shame
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center" :class="navigationHoverClass" to="/#metrics">
            Metrics
          </NuxtLink>
          <NuxtLink class="group/navigation-menu-trigger text-sm text-white leading-6 font-body font-normal px-4 py-2 outline-none rounded-full bg-transparent inline-flex h-9 w-max cursor-pointer transition-all items-center justify-center" :class="navigationHoverClass" to="/docs#api">
            API
          </NuxtLink>
        </div>

        <aside class="inline-flex gap-2 items-center">
          <button
            class="group/button text-sm text-white leading-5 font-body font-medium px-4 outline-none border-[1px] border-transparent rounded-full border-solid inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding"
            :class="navigationHoverClass"
            @click="loggedIn ? handleLogout() : handleLogin()"
          >
            {{ loggedIn ? "Logout" : "Login" }}
          </button>
          <span
            v-if="loggedIn && user?.login"
            class="text-xs tracking-[0.1em] font-meta px-3 py-1.5 border-[1px] rounded-full border-solid uppercase"
            :class="[signalTextClass, signalBorderClass]"
          >
            @{{ user.login }}
          </span>
          <button
            v-else
            class="group/button text-sm text-on-primary-fixed leading-5 font-body font-medium px-4 outline-none border-[1px] border-transparent rounded-full border-solid inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding"
            :class="primaryButtonClass"
            @click="handleLogin"
          >
            Connect GitHub
          </button>
        </aside>
      </nav>

      <nav
        class="border border-[lab(100%_0_0_/_0.1)] rounded-[14px] border-solid bg-[rgba(38,38,38,0.07)] max-h-[calc(100lvh-2rem)] w-full relative overflow-auto backdrop-blur-md md:max-h-[calc(60lvh-2rem)] lg:hidden"
        @wheel.stop
        @touchmove.stop
      >
        <div class="py-2 pl-2.5 pr-2 flex w-full items-center top-0 justify-between sticky z-50">
          <NuxtLink to="/" @click="closeMobileMenu">
            <div class="h-9 w-24 relative">
              <GrillmeLogo class="h-full w-full" :accent="logoAccent" />
            </div>
          </NuxtLink>

          <div class="inline-flex gap-2 items-center">
            <button
              class="group/button text-sm text-on-primary-fixed font-body font-normal px-4 outline-none border-[1px] border-transparent rounded-full border-solid inline-flex shrink-0 gap-1.5 h-9 cursor-pointer select-none whitespace-nowrap transition-all items-center justify-center bg-clip-padding"
              :class="primaryButtonClass"
              @click="loggedIn ? handleLogout() : handleLogin()"
            >
              {{ loggedIn ? "Logout" : "Connect GitHub" }}
            </button>
            <motion.button
              type="button"
              class="group rounded-lg size-9 cursor-pointer relative hover:bg-white/5"
              :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
              initial="hide"
              :animate="isMobileMenuOpen ? 'show' : 'hide'"
              @click="toggleMobileMenu"
            >
              <span class="h-6 w-6 left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2">
                <motion.span
                  class="rounded-full bg-white h-[1.2px] w-[20px] left-1/2 top-[7px] absolute -translate-x-1/2"
                  :variants="{
                    hide: { rotate: 0, y: 0 },
                    show: { rotate: 45, y: 4 },
                  }"
                  :transition="{ type: 'spring', stiffness: 620, damping: 22, mass: 0.68 }"
                />
                <motion.span
                  class="rounded-full bg-white h-[1.2px] w-[20px] left-1/2 top-[15px] absolute -translate-x-1/2"
                  :variants="{
                    hide: { rotate: 0, y: 0 },
                    show: { rotate: -45, y: -4 },
                  }"
                  :transition="{ type: 'spring', stiffness: 620, damping: 22, mass: 0.68 }"
                />
              </span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            v-if="isMobileMenuOpen"
            class="px-1 overflow-hidden md:px-4 lg:hidden"
            :initial="{ opacity: 0, height: 0 }"
            :animate="{ opacity: 1, height: 'auto' }"
            :exit="{ opacity: 0, height: 0 }"
            :transition="{ duration: 0.3, ease: 'easeInOut' }"
          >
            <motion.div
              class="pt-4 space-y-2.5"
              :variants="mobileMenuContainerVariants"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                v-for="item in mobileMenuItems"
                :key="item.to"
                :variants="mobileMenuItemVariants"
                :transition="{ duration: 0.3, ease: 'easeOut' }"
              >
                <NuxtLink
                  :to="item.to"
                  class="text-base text-white tracking-tight font-body font-medium px-3 py-1 block transition-colors duration-200 md:px-0"
                  @click="closeMobileMenu"
                >
                  {{ item.label }}
                </NuxtLink>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </nav>
    </aside>
  </header>
</template>
