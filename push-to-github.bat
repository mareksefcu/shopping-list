@echo off
echo === Checking Git Status ===
git status

echo.
echo === Adding all files ===
git add -A

echo.
echo === Checking what will be committed ===
git status

echo.
echo === Committing changes ===
git commit -m "Complete implementation: Backend API with MongoDB, Frontend with API integration, Insomnia export, and scenario descriptions"

echo.
echo === Pushing to GitHub ===
echo If authentication is required, you may need to:
echo 1. Use Personal Access Token instead of password
echo 2. Or set up SSH keys
echo.
git push origin main

echo.
echo === Done! ===
echo Check your repository at: https://github.com/mareksefcu/shopping-list
pause


