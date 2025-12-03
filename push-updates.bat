@echo off
echo ========================================
echo Pushing Updates to GitHub
echo ========================================
echo.

echo [1/4] Configuring git...
git config user.email "meteoradja@github.com"
git config user.name "Mas Ozang"

echo.
echo [2/4] Adding all files...
git add .

echo.
echo [3/4] Committing changes...
git commit -m "Fix signup error and add admin management tools

- Fixed signup error: Added max_streams parameter
- Improved error handling with detailed messages
- Added quick-reset-admin.js for easy admin password reset
- Added activate-all-users.js to activate inactive users
- Added fix-signup.js for signup diagnostics
- Added test-signup.js for signup testing
- Added comprehensive documentation (SIGNUP_FIX_GUIDE.md, RESET_ADMIN_GUIDE.md)
- Ready for production deployment"

echo.
echo [4/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Check your repository:
echo https://github.com/meteoradja-ytmjk/streamflowozang
echo ========================================
echo.
pause
