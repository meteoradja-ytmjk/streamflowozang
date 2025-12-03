@echo off
echo ========================================
echo Pushing StreamFlow to GitHub
echo ========================================
echo.

echo Configuring git...
git config user.email "meteoradja@github.com"
git config user.name "Mas Ozang"

echo.
echo Adding all files...
git add .

echo.
echo Committing changes...
git commit -m "Production ready: Complete deployment setup with documentation and scripts"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Check: https://github.com/meteoradja-ytmjk/streamflowozang
echo ========================================
pause
