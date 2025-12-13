# PowerShell script to push changes to GitHub
# Run this script: .\push-to-github.ps1

Write-Host "=== Checking Git Status ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Adding all files ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Checking what will be committed ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Committing changes ===" -ForegroundColor Cyan
git commit -m "Complete implementation: Backend API with MongoDB, Frontend with API integration, Insomnia export, and scenario descriptions"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
Write-Host "If authentication is required, you may need to:" -ForegroundColor Yellow
Write-Host "1. Use Personal Access Token instead of password" -ForegroundColor Yellow
Write-Host "2. Or run: gh auth login" -ForegroundColor Yellow
Write-Host ""

git push origin main

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Check your repository at: https://github.com/mareksefcu/shopping-list" -ForegroundColor Green





