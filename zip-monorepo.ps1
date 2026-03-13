param(
    [string]$DestinationPath = "",
    [switch]$VerboseList
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,
        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $baseTrimmed = $BasePath.TrimEnd([char[]]@('\', '/'))
    $baseUri = New-Object System.Uri(($baseTrimmed + [System.IO.Path]::DirectorySeparatorChar))
    $targetUri = New-Object System.Uri($TargetPath)
    $relativeUri = $baseUri.MakeRelativeUri($targetUri)
    return [System.Uri]::UnescapeDataString($relativeUri.ToString())
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if ([string]::IsNullOrWhiteSpace($DestinationPath)) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $repoName = Split-Path -Leaf $repoRoot
    $DestinationPath = Join-Path $repoRoot ("{0}-{1}.zip" -f $repoName, $timestamp)
}

$DestinationPath = [System.IO.Path]::GetFullPath($DestinationPath)

$excludedDirectoryNames = @(
    ".git",
    "node_modules",
    ".github",
    ".vscode",
    ".idea",
    "dist",
    "build",
    "coverage",
    ".next",
    ".turbo",
    "out"
)

$excludedFileNames = @(
    ".DS_Store",
    "Thumbs.db"
)

$allFiles = Get-ChildItem -Path $repoRoot -Recurse -File -Force

$filesToArchive = $allFiles | Where-Object {
    $fullPath = $_.FullName

    if ($fullPath -eq $DestinationPath) {
        return $false
    }

    foreach ($dirName in $excludedDirectoryNames) {
        if ($fullPath -match "[\\/]$([Regex]::Escape($dirName))([\\/]|$)") {
            return $false
        }
    }

    foreach ($fileName in $excludedFileNames) {
        if ($_.Name -ieq $fileName) {
            return $false
        }
    }

    return $true
}

if (-not $filesToArchive -or $filesToArchive.Count -eq 0) {
    throw "No files found to archive after applying exclusions."
}

if (Test-Path $DestinationPath) {
    Remove-Item -Path $DestinationPath -Force
}

if ($VerboseList) {
    Write-Host "Files being archived:" -ForegroundColor Cyan
    $filesToArchive |
        Sort-Object FullName |
        ForEach-Object {
            $_.FullName.Substring($repoRoot.Length + 1)
        }
}

$zipStream = [System.IO.File]::Open($DestinationPath, [System.IO.FileMode]::Create)
try {
    $zipArchive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $filesToArchive) {
            $relativePath = Get-RelativePath -BasePath $repoRoot -TargetPath $file.FullName
            $entryPath = $relativePath -replace "\\", "/"
            $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $file.FullName, $entryPath, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    }
    finally {
        $zipArchive.Dispose()
    }
}
finally {
    $zipStream.Dispose()
}

$relativeZipPath = if ($DestinationPath.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    $DestinationPath.Substring($repoRoot.Length + 1)
}
else {
    $DestinationPath
}
Write-Host "Created archive: $relativeZipPath" -ForegroundColor Green
Write-Host "Included files: $($filesToArchive.Count)" -ForegroundColor Green
