param(
  [string]$InputJson = "C:/HTML apps/Truthcert1_work/oracle_input.json",
  [string]$OutputJson = "C:/HTML apps/Truthcert1_work/oracle_output.json"
)

$ErrorActionPreference = "Stop"

$rscriptCandidates = @(
  "C:/Program Files/R/R-4.5.2/bin/Rscript.exe",
  "C:/Program Files/R/R-4.5.2/bin/x64/Rscript.exe",
  "C:/Program Files/R/R-4.4.0/bin/Rscript.exe",
  "C:/Program Files/R/R-4.4.0/bin/x64/Rscript.exe"
)

$rscript = $rscriptCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $rscript) {
  throw "Rscript.exe not found in Program Files. Update candidates in run_oracle_benchmark.ps1."
}

$scriptPath = "C:/HTML apps/Truthcert1_work/R_oracle_pairwise_benchmark.R"
if (-not (Test-Path $scriptPath)) {
  throw "Benchmark script not found: $scriptPath"
}

#
# Run R oracle script. R warnings may be emitted on stderr; only non-zero
# process exit should fail the benchmark runner.
#
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $rscript $scriptPath $InputJson $OutputJson
$exitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
if ($exitCode -ne $null -and $exitCode -ne 0) {
  throw "Oracle benchmark failed with exit code $exitCode"
}
Write-Output "Oracle benchmark complete: $OutputJson"
