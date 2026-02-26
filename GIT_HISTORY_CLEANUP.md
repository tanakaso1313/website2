# Git History Cleanup Guide

## Problem

The security audit revealed that API keys were hardcoded in the source code:
- Stripe publishable key: `pk_live_51RqS8c...`
- Amplitude API keys: `746eec9391b45c0239325340cd3baadd` and `d6ae733fdc47ac47f3ac0cb28e7f78bf`

Even though we've removed these keys from the current codebase, **they still exist in git history** and can be accessed by anyone who clones the repository.

## Solution

We need to rewrite git history to remove these keys from all commits.

---

## Option 1: Automated Script (Recommended)

### Prerequisites

1. **Install BFG Repo-Cleaner**:
   ```bash
   # macOS
   brew install bfg
   
   # Linux/Windows
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. **Create a backup** (the script does this automatically, but you can make an extra one):
   ```bash
   cd /path/to/repository
   tar -czf ../repo-backup-$(date +%Y%m%d).tar.gz .
   ```

### Running the Script

```bash
cd /Users/dts/CODE/SOWEBSITE
chmod +x website2/clean_git_history.sh
./website2/clean_git_history.sh
```

The script will:
1. Check prerequisites (BFG installed, in git repo)
2. Create an automatic backup
3. Show you what will be removed
4. Ask for confirmation
5. Clean the git history
6. Give you next steps

### After Running the Script

1. **Review the changes**:
   ```bash
   git log --all --oneline -20
   ```

2. **Force push** (WARNING: This rewrites remote history):
   ```bash
   git push --force --all
   git push --force --tags
   ```

3. **Notify all collaborators**:
   - They MUST delete their local clones
   - They MUST re-clone from the remote
   - Old clones will be incompatible

4. **Rotate the keys immediately**:
   - Stripe: https://dashboard.stripe.com/apikeys
   - Amplitude: https://amplitude.com/settings

---

## Option 2: Manual Cleanup (Advanced)

If you prefer to do this manually or BFG is not available:

### Using git-filter-branch

```bash
# Create backup first!
cd /Users/dts/CODE/SOWEBSITE
tar -czf ../repo-backup-$(date +%Y%m%d).tar.gz .

# Replace Stripe key in all commits
git filter-branch --tree-filter '
  find . -type f -name "*.js" -o -name "*.html" | xargs sed -i "" "s/pk_live_51RqS8cEcQzNRltK0GJYqWrHsLYlZgJ7YlUE8tRONOBfvgUzuJUDxA2NhQaBwS7oMz3dOCjjHhLRoKhC3N2Cx8XYz00xNvmKcCT/STRIPE_KEY_REMOVED/g"
  find . -type f -name "*.js" -o -name "*.html" | xargs sed -i "" "s/746eec9391b45c0239325340cd3baadd/AMPLITUDE_KEY_REMOVED/g"
  find . -type f -name "*.js" -o -name "*.html" | xargs sed -i "" "s/d6ae733fdc47ac47f3ac0cb28e7f78bf/AMPLITUDE_KEY_REMOVED/g"
' --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
git push --force --tags
```

---

## Option 3: Nuclear Option (Fresh Start)

If the repository is small or you want a completely clean slate:

1. **Create a new empty repository** on GitHub/GitLab
2. **Copy only the current clean code** (without .git):
   ```bash
   cd /Users/dts/CODE/SOWEBSITE
   mkdir ../SOWEBSITE-clean
   cp -r website2/* ../SOWEBSITE-clean/
   # Do NOT copy .git
   ```
3. **Initialize new git history**:
   ```bash
   cd ../SOWEBSITE-clean
   git init
   git add .
   git commit -m "Initial commit with cleaned code"
   git remote add origin <new-repo-url>
   git push -u origin main
   ```
4. **Archive the old repository** and update all references

---

## Important Warnings

### Before You Start

- ⚠️ **This rewrites git history** — it changes commit SHAs
- ⚠️ **All collaborators must re-clone** the repository
- ⚠️ **Open pull requests will need to be recreated**
- ⚠️ **CI/CD pipelines may need reconfiguration**
- ⚠️ **Make sure you have a backup!**

### After Cleaning History

1. **Keys are still compromised** until you rotate them
2. **Anyone who had access** to the old repository can still have copies of the keys
3. **GitHub/GitLab caches** may still show old commits for a while
4. **Search engine caches** (if the repo was public) may have indexed the keys

### Best Practice

**Rotate the keys immediately**, even if you clean the git history. History cleaning is defense in depth, but key rotation is the primary fix.

---

## Key Rotation Steps

### Stripe

1. Go to: https://dashboard.stripe.com/apikeys
2. Click on the exposed publishable key
3. Click "Roll key" or delete and create a new one
4. Update your environment variables with the new key
5. Deploy the updated configuration

### Amplitude

1. Go to: https://amplitude.com/settings
2. Navigate to your project settings
3. Go to "API Keys" section
4. Generate a new API key
5. Update your environment variables
6. Deploy the updated configuration

---

## Verification

After cleaning and rotating:

1. **Check git history**:
   ```bash
   git log --all --grep="pk_live_51RqS8c" --oneline
   git log --all --grep="746eec9391b45c0239325340cd3baadd" --oneline
   # Should return no results
   ```

2. **Search all files**:
   ```bash
   git grep "pk_live_51RqS8c" $(git rev-list --all)
   git grep "746eec9391b45c0239325340cd3baadd" $(git rev-list --all)
   # Should return no results
   ```

3. **Check remote**:
   ```bash
   git ls-remote --heads origin
   # Verify commit SHAs have changed
   ```

---

## Questions?

If you run into issues:
- Check the BFG documentation: https://rtyley.github.io/bfg-repo-cleaner/
- The backup is saved automatically by the script
- You can always restore from backup and try again
