param(
  [string]$ProjectRoot = "C:/HTML apps/Truthcert1_work",
  [string]$OutputRoot = "C:/HTML apps/Truthcert1_work/nightly_runs",
  [string]$OracleInputJson = "C:/HTML apps/Truthcert1_work/benchmark_pack/oracle_input_preregistered_v1.json",
  [switch]$SkipGLMM,
  [switch]$RequireGLMMArtifacts
)

$ErrorActionPreference = "Stop"

function Resolve-PythonExe {
  $candidates = @(
    "C:/Users/user/AppData/Local/Programs/Python/Python313/python.exe",
    "C:/Users/user/AppData/Local/Programs/Python/Python312/python.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) { return $c }
  }
  throw "Windows Python executable not found. Update Resolve-PythonExe candidates."
}

function Use-EnvVars {
  param([hashtable]$Vars, [scriptblock]$Action)

  $old = @{}
  foreach ($k in $Vars.Keys) {
    $old[$k] = [System.Environment]::GetEnvironmentVariable($k, "Process")
    [System.Environment]::SetEnvironmentVariable($k, [string]$Vars[$k], "Process")
  }

  try {
    & $Action
  }
  finally {
    foreach ($k in $Vars.Keys) {
      [System.Environment]::SetEnvironmentVariable($k, $old[$k], "Process")
    }
  }
}

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  $start = Get-Date
  $ok = $true
  $errorMsg = ""

  try {
    & $Action
  }
  catch {
    $ok = $false
    $errorMsg = $_.Exception.Message
  }

  $end = Get-Date
  [pscustomobject]@{
    name = $Name
    ok = $ok
    started_at = $start.ToString("yyyy-MM-dd HH:mm:ss")
    ended_at = $end.ToString("yyyy-MM-dd HH:mm:ss")
    duration_seconds = [math]::Round(($end - $start).TotalSeconds, 2)
    error = $errorMsg
  }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$runDir = Join-Path $OutputRoot "run_$timestamp"
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

$pythonExe = Resolve-PythonExe
$testV2 = Join-Path $ProjectRoot "test_truthcert_v2.py"
$testComprehensive = Join-Path $ProjectRoot "test_truthcert_comprehensive.py"
$oracleScript = Join-Path $ProjectRoot "run_oracle_benchmark.ps1"
$glmmRunner = Join-Path $ProjectRoot "run_latest_glmm_metafor_crosscheck.ps1"
$reportGenerator = Join-Path $ProjectRoot "tools/generate_locked_repro_report.py"

$oracleOut = Join-Path $runDir "oracle_output.json"
$oracleLog = Join-Path $runDir "oracle_run.log"
$glmmLog = Join-Path $runDir "glmm_crosscheck_run.log"
$v2Log = Join-Path $runDir "test_v2.log"
$compLog = Join-Path $runDir "test_comprehensive.log"
$summaryJson = Join-Path $runDir "nightly_summary.json"
$summaryMd = Join-Path $runDir "nightly_summary.md"

$steps = @()

$steps += Invoke-Step -Name "oracle_preregistered_pack" -Action {
  if (-not (Test-Path -LiteralPath $oracleScript)) {
    throw "Missing oracle script: $oracleScript"
  }
  if (-not (Test-Path -LiteralPath $OracleInputJson)) {
    throw "Missing preregistered oracle input JSON: $OracleInputJson"
  }
  & $oracleScript -InputJson $OracleInputJson -OutputJson $oracleOut *>&1 | Tee-Object -FilePath $oracleLog | Out-Null
  if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
    throw "Oracle benchmark exited with code $LASTEXITCODE"
  }
}

$steps += Invoke-Step -Name "glmm_metafor_crosscheck" -Action {
  if (-not (Test-Path -LiteralPath $glmmRunner)) {
    throw "Missing GLMM runner script: $glmmRunner"
  }

  if ($SkipGLMM) {
    "SKIPPED: GLMM cross-check skipped by -SkipGLMM flag." | Set-Content -Encoding UTF8 -Path $glmmLog
    return
  }

  $latestR = Get-ChildItem -LiteralPath $ProjectRoot -Filter "truthcert_glmm_metafor_crosscheck_*.R" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $latestR) {
    $msg = "SKIPPED: no exported GLMM cross-check R script found in project root."
    $msg | Set-Content -Encoding UTF8 -Path $glmmLog
    if ($RequireGLMMArtifacts) {
      throw $msg
    }
    return
  }

  $scriptCopy = Join-Path $runDir $latestR.Name
  Copy-Item -LiteralPath $latestR.FullName -Destination $scriptCopy -Force

  Push-Location $runDir
  try {
    & $glmmRunner -ScriptPath $scriptCopy *>&1 | Tee-Object -FilePath $glmmLog | Out-Null
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
      throw "GLMM cross-check runner exited with code $LASTEXITCODE"
    }
  }
  finally {
    Pop-Location
  }
}

$steps += Invoke-Step -Name "firefox_test_v2" -Action {
  if (-not (Test-Path -LiteralPath $testV2)) {
    throw "Missing test script: $testV2"
  }

  Use-EnvVars -Vars @{ TRUTHCERT_BROWSER = "firefox"; TRUTHCERT_HEADLESS = "1" } -Action {
    & $pythonExe -u $testV2 *>&1 | Tee-Object -FilePath $v2Log | Out-Null
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
      throw "test_truthcert_v2.py exited with code $LASTEXITCODE"
    }
  }
}

$steps += Invoke-Step -Name "firefox_test_comprehensive" -Action {
  if (-not (Test-Path -LiteralPath $testComprehensive)) {
    throw "Missing test script: $testComprehensive"
  }

  Use-EnvVars -Vars @{ TRUTHCERT_BROWSER = "firefox"; TRUTHCERT_HEADLESS = "1" } -Action {
    & $pythonExe -u $testComprehensive *>&1 | Tee-Object -FilePath $compLog | Out-Null
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
      throw "test_truthcert_comprehensive.py exited with code $LASTEXITCODE"
    }
  }
}

$steps += Invoke-Step -Name "locked_repro_report" -Action {
  if (-not (Test-Path -LiteralPath $reportGenerator)) {
    throw "Missing report generator: $reportGenerator"
  }

  & $pythonExe -u $reportGenerator `
    --project-root $ProjectRoot `
    --run-dir $runDir `
    --v2-log $v2Log `
    --comprehensive-log $compLog `
    --oracle-json $oracleOut `
    --glmm-log $glmmLog *>&1 | Tee-Object -FilePath (Join-Path $runDir "locked_report_generation.log") | Out-Null

  if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
    throw "generate_locked_repro_report.py exited with code $LASTEXITCODE"
  }
}

$stepResults = $steps | Where-Object {
  $_ -is [psobject] -and
  ($_.PSObject.Properties.Name -contains "name") -and
  ($_.PSObject.Properties.Name -contains "ok")
}
$allOk = ($stepResults | Where-Object { -not $_.ok }).Count -eq 0

$summary = [pscustomobject]@{
  generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  project_root = $ProjectRoot
  run_dir = $runDir
  overall_ok = $allOk
  steps = $stepResults
  artifacts = [pscustomobject]@{
    oracle_output = $oracleOut
    oracle_log = $oracleLog
    glmm_log = $glmmLog
    test_v2_log = $v2Log
    test_comprehensive_log = $compLog
  }
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $summaryJson

$md = @()
$md += "# Nightly Quality Gate Summary"
$md += ""
$md += "Generated: $($summary.generated_at)"
$md += "Run dir: $($summary.run_dir)"
$md += "Overall OK: **$($summary.overall_ok)**"
$md += ""
$md += "## Steps"
foreach ($s in $stepResults) {
  $status = if ($s.ok) { "PASS" } else { "FAIL" }
  $line = "- $status - $($s.name) ($($s.duration_seconds)s)"
  if (-not $s.ok -and $s.error) {
    $line += " - $($s.error)"
  }
  $md += $line
}
$md += ""
$md += "## Artifacts"
$md += "- oracle_output: $oracleOut"
$md += "- oracle_log: $oracleLog"
$md += "- glmm_log: $glmmLog"
$md += "- test_v2_log: $v2Log"
$md += "- test_comprehensive_log: $compLog"

$md -join "`n" | Set-Content -Encoding UTF8 $summaryMd

Write-Output "Nightly run directory: $runDir"
Write-Output "Summary JSON: $summaryJson"
Write-Output "Summary MD: $summaryMd"

if (-not $allOk) {
  exit 1
}
