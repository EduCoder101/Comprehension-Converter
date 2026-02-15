# Sync static site files into docs/ for GitHub Pages (no Node.js required).
# Run this when you change index.html or any file in public/ so docs/ stays up to date.
# Usage: In PowerShell, run: .\sync-static-to-docs.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$docs = Join-Path $root "docs"

if (-not (Test-Path $docs)) { New-Item -ItemType Directory -Path $docs | Out-Null }

Copy-Item (Join-Path $root "index.html") (Join-Path $docs "index.html") -Force
Get-ChildItem (Join-Path $root "public\*") -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $docs $_.Name) -Force }

Write-Host "Synced index.html and public\* to docs\"
