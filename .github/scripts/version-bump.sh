#!/bin/bash

# Script to bump version and create a git tag

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version argument required${NC}"
    echo "Usage: $0 <major|minor|patch|version>"
    echo "Examples:"
    echo "  $0 patch     # Bump patch version"
    echo "  $0 minor     # Bump minor version"
    echo "  $0 major     # Bump major version"
    echo "  $0 1.2.3     # Set specific version"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${GREEN}$CURRENT_VERSION${NC}"

# Bump version based on argument
if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Specific version provided
    NEW_VERSION=$1
else
    # Use npm version to bump
    NEW_VERSION=$(npm version $1 --no-git-tag-version | sed 's/v//')
fi

echo -e "New version: ${GREEN}$NEW_VERSION${NC}"

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

# Commit changes
git add package.json package-lock.json
git commit -m "chore: bump version to v$NEW_VERSION"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo -e "${GREEN}✓ Version bumped to $NEW_VERSION${NC}"
echo -e "${GREEN}✓ Git tag v$NEW_VERSION created${NC}"
echo ""
echo "Next steps:"
echo "  1. Push changes: git push origin main"
echo "  2. Push tag: git push origin v$NEW_VERSION"
echo "  3. GitHub Actions will automatically create a release"