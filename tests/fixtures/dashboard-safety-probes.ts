import type { DashboardSafetyCategory, DashboardSafetyImpact, DashboardSafetySeverity } from '../../server/roast/dashboard-ai-scoring'

export interface DashboardSafetyProbe {
  id: string
  repository: string
  username: string
  kind: 'introduced-risk' | 'fix'
  category: DashboardSafetyCategory
  impact: DashboardSafetyImpact
  severity: DashboardSafetySeverity
  filename: string
  patch: string
  expectedPenalty: number
}

export interface DashboardSafetyRepositoryProbe extends DashboardSafetyProbe {
  commitSha: string
  sourceUrl: string
}

/**
 * Controlled probes based on intentionally vulnerable training repositories.
 * These are compact contract fixtures, not copied upstream commits. A live
 * repository run still needs a repo-scoped commit SHA and its actual patch.
 */
export const dashboardSafetyProbeSet: readonly DashboardSafetyProbe[] = [
  {
    id: 'nodegoat-eval-introduced',
    repository: 'owasp/NodeGoat',
    username: 'owasp',
    kind: 'introduced-risk',
    category: 'validation',
    impact: 'introduced',
    severity: 'high',
    filename: 'routes/contributions.js',
    patch: '+ const amount = eval(req.body.amount)',
    expectedPenalty: 30,
  },
  {
    id: 'nodegoat-eval-fixed',
    repository: 'owasp/NodeGoat',
    username: 'owasp',
    kind: 'fix',
    category: 'validation',
    impact: 'fixed',
    severity: 'high',
    filename: 'routes/contributions.js',
    patch: '+ const amount = Number.parseInt(req.body.amount, 10)',
    expectedPenalty: 0,
  },
  {
    id: 'dvwa-sqli-introduced',
    repository: 'digininja/DVWA',
    username: 'digininja',
    kind: 'introduced-risk',
    category: 'validation',
    impact: 'introduced',
    severity: 'medium',
    filename: 'dvwa/vulnerabilities/sqli/source/low.php',
    patch: '+ $query = "SELECT * FROM users WHERE user_id = " . $_GET[\'id\'];',
    expectedPenalty: 15,
  },
  {
    id: 'dvwa-sqli-fixed',
    repository: 'digininja/DVWA',
    username: 'digininja',
    kind: 'fix',
    category: 'validation',
    impact: 'fixed',
    severity: 'medium',
    filename: 'dvwa/vulnerabilities/sqli/source/low.php',
    patch: '+ $id = mysqli_real_escape_string($GLOBALS[\'___mysqli_ston\'], $_GET[\'id\']);',
    expectedPenalty: 0,
  },
  {
    id: 'benchmark-secret-introduced',
    repository: 'OWASP-Benchmark/BenchmarkJava',
    username: 'OWASP-Benchmark',
    kind: 'introduced-risk',
    category: 'secrets',
    impact: 'introduced',
    severity: 'high',
    filename: 'src/main/java/org/owasp/benchmark/Example.java',
    patch: '+ String apiKey = "hard-coded-demo-secret";',
    expectedPenalty: 50,
  },
  {
    id: 'benchmark-secret-fixed',
    repository: 'OWASP-Benchmark/BenchmarkJava',
    username: 'OWASP-Benchmark',
    kind: 'fix',
    category: 'secrets',
    impact: 'fixed',
    severity: 'high',
    filename: 'src/main/java/org/owasp/benchmark/Example.java',
    patch: '+ String apiKey = System.getenv("API_KEY");',
    expectedPenalty: 0,
  },
]

/**
 * Repository-backed calibration probes. Each excerpt is taken from the
 * changed lines of the immutable commit linked by sourceUrl; it is not a
 * username aggregate or a claim about the repository's maintainers.
 */
export const dashboardSafetyRepositoryProbeSet: readonly DashboardSafetyRepositoryProbe[] = [
  {
    id: 'nodegoat-eval-commit',
    repository: 'OWASP/NodeGoat',
    username: 'owasp',
    kind: 'introduced-risk',
    category: 'validation',
    impact: 'introduced',
    severity: 'high',
    filename: 'app/routes/contributions.js',
    patch: '+ var preTax = eval(req.body.preTax);\n+ var afterTax = eval(req.body.afterTax);\n+ var roth = eval(req.body.roth);',
    expectedPenalty: 30,
    commitSha: 'c28fd67dbc7f44a22fbaa50cf952150de9a69eea',
    sourceUrl: 'https://github.com/OWASP/NodeGoat/commit/c28fd67dbc7f44a22fbaa50cf952150de9a69eea',
  },
  {
    id: 'dvwa-auth-bypass-commit',
    repository: 'digininja/DVWA',
    username: 'digininja',
    kind: 'introduced-risk',
    category: 'auth',
    impact: 'introduced',
    severity: 'high',
    filename: 'vulnerabilities/sst/protected/include.php',
    patch: '+ if ($user == "admin" && $password = "secret") {',
    expectedPenalty: 50,
    commitSha: 'a2c13e53ba949b3bc991068781682b4d7185f3b8',
    sourceUrl: 'https://github.com/digininja/DVWA/commit/a2c13e53ba949b3bc991068781682b4d7185f3b8',
  },
  {
    id: 'benchmark-hardcoded-secret-commit',
    repository: 'OWASP-Benchmark/BenchmarkJava',
    username: 'darkspirit510',
    kind: 'introduced-risk',
    category: 'secrets',
    impact: 'introduced',
    severity: 'high',
    filename: 'src/main/java/org/owasp/benchmark/report/sonarqube/SonarReport.java',
    patch: '+ private static final String SONAR_PASSWORD = "P4ssword!!!!";',
    expectedPenalty: 50,
    commitSha: '32933c4e6edfa00e0e3123f6ec54c9ac286950ba',
    sourceUrl: 'https://github.com/OWASP-Benchmark/BenchmarkJava/commit/32933c4e6edfa00e0e3123f6ec54c9ac286950ba',
  },
]
