param (
    [Parameter(Mandatory=$true)]
    [string]$Version
)

# 1. Update version in .env file automatically
$envFile = ".env"
$content = Get-Content $envFile
$content = $content -replace "APP_VERSION=.*", "APP_VERSION=$Version"
$content | Set-Content $envFile

# 2. Set environment variables for the build
$env:APP_VERSION = $Version
$env:NEXT_PUBLIC_API_URL = "https://fedora.tail18eb3c.ts.net/api"

Write-Host "--- Starting Build for $Version ---" -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml build

Write-Host "--- Pushing to Docker Hub ---" -ForegroundColor Green
docker compose -f docker-compose.prod.yml push

Write-Host "--- Uploading Config to Fedora ---" -ForegroundColor Yellow
scp .env arunkrishna@fedora:/home/arunkrishna/faculty-appointment-system/
scp docker-compose.prod.yml arunkrishna@fedora:/home/arunkrishna/faculty-appointment-system/

Write-Host "--- DONE! Now run 'docker compose pull && docker compose up -d' on Fedora ---" -ForegroundColor Magenta
