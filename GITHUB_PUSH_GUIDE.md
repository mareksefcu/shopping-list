# Guide to Push Changes to GitHub

Since automated push isn't working, please follow these steps manually:

## Option 1: Run the Batch Script (Easiest)

1. Double-click `push-to-github.bat` in Windows Explorer
2. Or run in terminal: `.\push-to-github.bat`

## Option 2: Run PowerShell Script

1. Open PowerShell in the project directory
2. Run: `.\push-to-github.ps1`

## Option 3: Manual Commands

Open Git Bash or PowerShell in the project directory and run:

```bash
# 1. Check status
git status

# 2. Add all files
git add -A

# 3. Check what will be committed
git status

# 4. Commit changes
git commit -m "Complete implementation: Backend API with MongoDB, Frontend with API integration, Insomnia export, and scenario descriptions"

# 5. Push to GitHub
git push origin main
```

## If Authentication Fails

If `git push` asks for credentials:

### Option A: Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. When prompted for password, paste the token instead

### Option B: GitHub CLI
```bash
gh auth login
git push origin main
```

### Option C: SSH (if you have SSH keys set up)
```bash
git remote set-url origin git@github.com:mareksefcu/shopping-list.git
git push origin main
```

## Files That Should Be Pushed

Make sure these new files are included:

### Backend:
- `Shopping-list-backend/SCENARIOS.md`
- `Shopping-list-backend/EVALUATION_CHECKLIST.md`
- `Shopping-list-backend/test/insomnia/Shopping List API.json`
- `Shopping-list-backend/config/database.js`
- `Shopping-list-backend/database/mongodb.js`
- `Shopping-list-backend/models/User.js`
- `Shopping-list-backend/models/ShoppingList.js`

### Frontend:
- `src/AppAPI.jsx`
- `src/components/LoginForm.jsx`
- `src/components/ShoppingListDetailAPI.jsx`
- `src/services/apiService.js`
- `src/services/mockData.js`
- `src/config/api.js`
- `src/utils/errorHandler.js`
- `src/hooks/useApiState.js`
- `src/index.js` (updated)

### Documentation:
- `EVALUATION_CHECKLIST.md`
- `README_FRONTEND.md`

## Verify Push

After pushing, check:
https://github.com/mareksefcu/shopping-list

You should see:
- New commit in the commit history
- New files in the repository
- Updated file timestamps





