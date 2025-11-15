#!/bin/bash
# Git commit helper script

echo "=== SajiloKaam Git Commit Helper ==="
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "Error: Not a git repository"
    exit 1
fi

# Show current status
echo "Current git status:"
git status --short
echo ""

# Ask for commit message
read -p "Enter commit message: " commit_msg

if [ -z "$commit_msg" ]; then
    echo "Error: Commit message cannot be empty"
    exit 1
fi

# Add all changes
echo "Adding all changes..."
git add .

# Commit
echo "Committing..."
git commit -m "$commit_msg"

# Show result
echo ""
echo "✓ Commit created successfully!"
echo ""
echo "To push to GitHub, run:"
echo "  git push origin main"
echo ""

