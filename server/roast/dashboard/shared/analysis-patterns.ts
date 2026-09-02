export const dashboardTestFilePattern = /(?:^|\/)(?:__tests__|tests?|specs?)(?:\/|$)|\.(?:test|spec)\.[^.]+$/i
export const dashboardCiFilePattern = /(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:Jenkinsfile|azure-pipelines\.ya?ml)$/i
export const dashboardValidationFilePattern = /(?:^|\/)(?:schemas?|validators?|validation|middleware|guards?)(?:\/|$)|(?:schema|validator|validation|guard)[^/]*\.[^.]+$/i
export const dashboardDocumentationFilePattern = /(?:^|\/)(?:readme|docs?)(?:\.|\/|$)|\.md$/i
export const dashboardRiskyFilePattern = /(?:^|\/)(?:auth|security|permissions?|secrets?|database|db|payments?)(?:\/|$)|(?:auth|security|permission|secret|database|payment)[^/]*\.[^.]+$/i
export const dashboardDefensivePatchPattern = /\b(?:try\s*\{|catch\s*\(|validate|sanitize|escape|authorize|permission|fallback|throw new)\b/i
export const dashboardRiskyPatchPattern = /\b(?:eval\s*\(|innerHTML\s*=|dangerouslySetInnerHTML|child_process|exec\s*\(|spawn\s*\(|SELECT[^;\n]{0,120}(?:\+|\$\{|format\s*\()|(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{16,}['"])/i
