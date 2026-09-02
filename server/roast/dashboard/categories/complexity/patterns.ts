import { dashboardDocumentationFilePattern, dashboardTestFilePattern } from '../../shared/analysis-patterns'

export const complexityExcludedFilePattern = /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|\.nuxt|\.changeset|generated)(?:\/|$)|(?:^|\/)(?:generated[^/]*|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|npm-shrinkwrap\.json|CHANGELOG(?:\.[^/]+)?|release-notes(?:\.[^/]+)?)$/i
export const complexityTestFilePattern = dashboardTestFilePattern
export const complexityDocumentationFilePattern = dashboardDocumentationFilePattern
export const complexityNonCodeFilePattern = /(?:^|\/)[^/]+\.kicad_block(?:\/|$)|\.(?:kicad_pcb|kicad_prl|kicad_pro|kicad_sch|pcb|sch|brd|dsn|gbr|step|stp|stl|iges|wrl|svg|png|jpe?g|gif|webp|ico|pdf|zip|tar|gz|bin|hex|uf2)$/i
