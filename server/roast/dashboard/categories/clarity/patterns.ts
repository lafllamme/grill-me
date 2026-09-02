export const clarityDeclarationPattern = /^(?:export(?:\s+default)?\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/
export const clarityGenericIdentifierPattern = /^(?:[xyzijkn]|data|item|value|thing|stuff|tmp|temp|obj|res|result|foo|bar|baz|misc)$/i
export const clarityCommentPattern = /^\s*(?:\/\/|\/\*|\*|#)/
export const clarityLongLinePattern = /^.{121,}$/
export const clarityDeepIndentPattern = /^\s{12,}|^\t{3,}/
