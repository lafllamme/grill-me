import type { DashboardRoleEvidenceRules, DashboardRoleThresholds } from './types'

export const DASHBOARD_ROLE_EVIDENCE_RULES = {
  minimumCommits: 3,
} as const satisfies DashboardRoleEvidenceRules

export const DASHBOARD_ROLE_THRESHOLDS = {
  'Ungrillable': { allAxesMinimum: 80 },
  'Edge-Case Sheriff': {
    axes: {
      safety: { minimum: 85 },
      clarity: { minimum: 65 },
      workflow: { minimum: 60 },
      complexity: { minimum: 60 },
      context: { minimum: 60 },
    },
  },
  'Human Compiler': {
    axes: {
      clarity: { minimum: 85 },
      safety: { minimum: 60 },
      workflow: { minimum: 60 },
      complexity: { minimum: 65 },
      context: { minimum: 65 },
    },
  },
  'Dependency Detective': {
    axes: {
      complexity: { minimum: 85 },
      clarity: { minimum: 70 },
      safety: { minimum: 65 },
      workflow: { minimum: 60 },
      context: { minimum: 60 },
    },
  },
  'Git Gardener': {
    axes: {
      workflow: { minimum: 85 },
      clarity: { minimum: 70 },
      safety: { minimum: 60 },
      complexity: { minimum: 60 },
      context: { minimum: 60 },
    },
  },
  'Freddy Spaghetti': {
    axes: {
      clarity: { minimum: 40, maximum: 60 },
      safety: { minimum: 65 },
      workflow: { minimum: 65 },
      complexity: { minimum: 60 },
      context: { minimum: 65 },
    },
  },
  'Risk Runner': {
    axes: {
      safety: { minimum: 40, maximum: 60 },
      clarity: { minimum: 65 },
      workflow: { minimum: 65 },
      complexity: { minimum: 65 },
      context: { minimum: 65 },
    },
  },
  'Careful Squasher': {
    axes: {
      workflow: { minimum: 40, maximum: 60 },
      clarity: { minimum: 70 },
      safety: { minimum: 70 },
      complexity: { minimum: 60 },
      context: { minimum: 70 },
    },
  },
  'Wrapper Addict': {
    axes: {
      complexity: { minimum: 40, maximum: 60 },
      clarity: { minimum: 65 },
      safety: { minimum: 65 },
      workflow: { minimum: 65 },
      context: { minimum: 65 },
    },
  },
  'Docs Dodger': {
    axes: {
      context: { maximum: 50 },
      clarity: { minimum: 65 },
      safety: { minimum: 65 },
      workflow: { minimum: 65 },
      complexity: { minimum: 65 },
    },
  },
  'Brain Dumper': {
    axes: {
      clarity: { maximum: 35 },
      safety: { minimum: 55 },
      workflow: { minimum: 55 },
      complexity: { minimum: 55 },
      context: { minimum: 55 },
    },
  },
  'Finger Crosser': {
    axes: {
      safety: { maximum: 35 },
      clarity: { minimum: 55 },
      workflow: { minimum: 55 },
      complexity: { minimum: 55 },
      context: { minimum: 55 },
    },
  },
  'Big-Bang Committer': {
    axes: {
      workflow: { maximum: 35 },
      clarity: { minimum: 55 },
      safety: { minimum: 55 },
      complexity: { minimum: 55 },
      context: { minimum: 55 },
    },
  },
  'Merge Conflict Magician': {
    axes: {
      complexity: { maximum: 35 },
      clarity: { minimum: 55 },
      safety: { minimum: 55 },
      workflow: { minimum: 55 },
      context: { minimum: 55 },
    },
  },
  'README Houdini': {
    axes: {
      context: { maximum: 35 },
      clarity: { minimum: 55 },
      safety: { minimum: 55 },
      workflow: { minimum: 55 },
      complexity: { minimum: 55 },
    },
  },
  'Vibe Coder': {
    lowScoreThreshold: 45,
    minimumLowScores: 3,
  },
} as const satisfies DashboardRoleThresholds
