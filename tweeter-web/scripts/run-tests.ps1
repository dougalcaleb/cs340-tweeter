$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $envFile)) {
  throw "Missing .env file at '$envFile'. Add VITE_API_BASE_URL to tweeter-web/.env first."
}

$apiBaseUrl = $null
foreach ($line in Get-Content $envFile) {
  $trimmed = $line.Trim()
  if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
    continue
  }

  if ($trimmed -match '^VITE_API_BASE_URL\s*=\s*(.+)$') {
    $apiBaseUrl = $Matches[1].Trim()
    break
  }
}

if (-not $apiBaseUrl) {
  throw "VITE_API_BASE_URL was not found in '$envFile'."
}

if (($apiBaseUrl.StartsWith('"') -and $apiBaseUrl.EndsWith('"')) -or ($apiBaseUrl.StartsWith("'") -and $apiBaseUrl.EndsWith("'"))) {
  $apiBaseUrl = $apiBaseUrl.Substring(1, $apiBaseUrl.Length - 2)
}

if ([string]::IsNullOrWhiteSpace($apiBaseUrl)) {
  throw "VITE_API_BASE_URL in '$envFile' is empty."
}

$env:VITE_API_BASE_URL = $apiBaseUrl
Write-Host "Running tests with VITE_API_BASE_URL=$apiBaseUrl"

Push-Location $projectRoot
try {
  npm test
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}
finally {
  Pop-Location
}
