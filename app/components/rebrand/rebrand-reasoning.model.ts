export type RebrandReasoningStepStatus = 'complete' | 'active' | 'pending'

export type RebrandEvidenceKind = 'repository' | 'commit' | 'file' | 'prompt'

export interface RebrandEvidenceReference {
  kind: RebrandEvidenceKind
  label: string
}

export interface RebrandReasoningStep {
  id: string
  phase: string
  label: string
  description: string
  activities: string[]
  icon: string
  status: RebrandReasoningStepStatus
  evidence: RebrandEvidenceReference[]
}
