#!/bin/bash
set -euo pipefail

# Git History Cleaning Script
# This script removes exposed API keys from git history using BFG Repo-Cleaner
# 
# WARNING: This rewrites git history. All collaborators must re-clone the repository.
# Make sure you have a backup before running this!

echo "==============================================" echo "Git History Cleaning Script"
echo "==============================================\n"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository root. Please run from the repository root."
    exit 1
fi

echo "Step 1: Checking prerequisites...\n"

# Check if BFG is installed
if ! command -v bfg &> /dev/null; then
    echo "BFG Repo-Cleaner is not installed."
    echo ""
    echo "Install options:"
    echo "  macOS:   brew install bfg"
    echo "  Linux:   Download from https://rtyley.github.io/bfg-repo-cleaner/"
    echo "  Manual:  Place bfg.jar in your PATH"
    echo ""
    echo "Alternative: Install Java and download bfg.jar:"
    echo "  wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -O bfg.jar"
    echo "  Then use: java -jar bfg.jar instead of bfg command"
    exit 1
fi

echo "✓ BFG Repo-Cleaner is installed\n"

# Create a backup
echo "Step 2: Creating backup...\n"
BACKUP_DIR="../$(basename "$PWD")-backup-$(date +%Y%m%d-%H%M%S)"
echo "Creating backup at: $BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo "✓ Backup created\n"

# Create a file with patterns to remove
echo "Step 3: Creating patterns file...\n"
cat > replacements.txt << 'EOF'
# Stripe keys (both live and test)
pk_live_51RqS8cEcQzNRltK0GJYqWrHsLYlZgJ7YlUE8tRONOBfvgUzuJUDxA2NhQaBwS7oMz3dOCjjHhLRoKhC3N2Cx8XYz00xNvmKcCT===>STRIPE_KEY_REMOVED
sk_live_===>STRIPE_SECRET_REMOVED
sk_test_===>STRIPE_SECRET_REMOVED

# Amplitude keys
746eec9391b45c0239325340cd3baadd===>AMPLITUDE_KEY_REMOVED
d6ae733fdc47ac47f3ac0cb28e7f78bf===>AMPLITUDE_KEY_REMOVED
EOF

echo "✓ Patterns file created\n"

# Show what will be cleaned
echo "Step 4: Keys that will be removed from history:"
cat replacements.txt
echo ""

# Ask for confirmation
read -p "This will rewrite git history. Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Aborted. Backup is still available at: $BACKUP_DIR"
    rm replacements.txt
    exit 0
fi

echo "\nStep 5: Running BFG to clean git history...\n"

# Make sure HEAD is clean (BFG doesn't touch HEAD)
echo "First, committing current changes to HEAD..."
git add -A
git commit -m "Security: Remove exposed API keys from codebase" || echo "(No changes to commit)"

# Run BFG
echo "\nRunning BFG (this may take a while for large repositories)...\n"
bfg --replace-text replacements.txt

echo "\n✓ BFG completed\n"

echo "Step 6: Cleaning up repository...\n"

# Expire all reflog entries and garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✓ Repository cleaned\n"

# Clean up
rm replacements.txt

echo "==============================================" echo "History cleaning complete!"
echo "==============================================\n"

echo "Next steps:"
echo ""
echo "1. Review the changes:"
echo "   git log --oneline -20"
echo "   git diff HEAD~5..HEAD"
echo ""
echo "2. Force push to remote (THIS REWRITES HISTORY):"
echo "   git push --force --all"
echo "   git push --force --tags"
echo ""
echo "3. Notify all collaborators:"
echo "   - They must delete their local clones"
echo "   - They must re-clone the repository"
echo "   - Old clones are now incompatible"
echo ""
echo "4. Rotate the keys:"
echo "   - Stripe: https://dashboard.stripe.com/apikeys"
echo "   - Amplitude: https://amplitude.com settings"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
