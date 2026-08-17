<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'

defineProps<{ fixture: RoastExplorerFixture, open: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="border-t-[1px] border-divider border-solid bg-surface-container" :class="open ? 'block' : 'hidden'">
    <div class="p-5 sm:p-8">
      <div class="gap-4 grid grid-cols-3">
        <div>
          <p class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
            Commits
          </p><p class="text-2xl font-body mt-2">
            {{ fixture.meta.commitCount }}
          </p>
        </div>
        <div>
          <p class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
            Files
          </p><p class="text-2xl font-body mt-2">
            {{ fixture.evidence.commits.reduce((sum, commit) => sum + commit.changedFiles, 0) }}
          </p>
        </div>
        <div>
          <p class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
            Diff
          </p><p class="text-2xl font-body mt-2">
            +{{ fixture.evidence.commits.reduce((sum, commit) => sum + commit.additions, 0) }} / -{{ fixture.evidence.commits.reduce((sum, commit) => sum + commit.deletions, 0) }}
          </p>
        </div>
      </div>
      <div class="mt-7 border-t-[1px] border-divider border-solid">
        <details v-for="commit in fixture.evidence.commits" :key="commit.sha" class="group border-b-[1px] border-divider border-solid">
          <summary class="py-4 list-none flex gap-4 cursor-pointer items-start justify-between">
            <div>
              <p class="text-sm font-body">
                {{ commit.message }}
              </p><p class="text-[10px] text-on-surface-variant font-meta mt-2">
                {{ commit.sha }} · +{{ commit.additions }} / -{{ commit.deletions }}
              </p>
            </div>
            <span class="text-primary font-meta">+</span>
          </summary>
          <div class="pb-5 space-y-3">
            <div v-for="file in commit.files" :key="file.filename" class="p-4 border-[1px] border-divider rounded-[1rem] border-solid bg-surface-container-low">
              <div class="text-[10px] text-on-surface-variant font-meta flex gap-3 justify-between">
                <span>{{ file.filename }}</span><span>+{{ file.additions }} / -{{ file.deletions }}</span>
              </div>
              <pre class="text-[10px] text-on-surface-variant leading-relaxed font-mono mt-4 whitespace-pre-wrap">{{ file.patch }}</pre>
            </div>
          </div>
        </details>
      </div>
      <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta mt-6 uppercase hover:text-primary" @click="emit('toggle')">
        Close evidence
      </button>
    </div>
  </div>
</template>
