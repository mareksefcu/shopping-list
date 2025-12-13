# PowerShell script to create frontend build and zip for submission

Write-Host "=== Creating Frontend Build ===" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Build successful! ===" -ForegroundColor Green
    
    Write-Host "`n=== Creating ZIP file ===" -ForegroundColor Cyan
    $zipName = "frontend-build-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip"
    
    # Remove old zip if exists
    if (Test-Path $zipName) {
        Remove-Item $zipName
    }
    
    # Create zip of build folder
    Compress-Archive -Path "build\*" -DestinationPath $zipName -Force
    
    Write-Host "`n=== ZIP created: $zipName ===" -ForegroundColor Green
    Write-Host "File size: $((Get-Item $zipName).Length / 1MB) MB" -ForegroundColor Yellow
    Write-Host "`n=== Ready for submission! ===" -ForegroundColor Green
    Write-Host "Upload this file: $zipName" -ForegroundColor Yellow
} else {
    Write-Host "`n=== Build failed! ===" -ForegroundColor Red
    Write-Host "Please check the errors above." -ForegroundColor Red
}




