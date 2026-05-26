#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

# Check if there are changes (including untracked files, excluding ignored ones)
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes detected. Vault is fully up to date."
  exit 0
fi

# Get current date and time
TIMESTAMP=$(date +"%Y-%m-%d %I:%M %p")

echo "Changes detected! Creating a secure checkpoint..."
git add .
git commit -m "Auto-checkpoint: $TIMESTAMP"

echo "✅ Checkpoint successfully created at $TIMESTAMP!"
git log -n 1 --stat
