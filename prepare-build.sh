#!/bin/bash

echo "🚀 Preparing Network Tools Hub for distribution..."

# Remove existing settings.json to ensure defaults are used
if [ -f "settings.json" ]; then
    echo "📦 Backing up current settings to settings.backup.json"
    cp settings.json settings.backup.json
    rm settings.json
    echo "✅ Removed settings.json (will use defaults)"
fi

# Clean node_modules and reinstall
echo "📦 Cleaning and reinstalling dependencies..."
rm -rf node_modules
npm install

# Rebuild native modules for Electron
echo "🔧 Rebuilding native modules for Electron..."
npm rebuild
npx electron-rebuild

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/

# Run the build
echo "🔨 Building application..."
npm run make

echo "✅ Build complete! Check the 'out/make' directory for distributables."
echo ""
echo "📝 Notes:"
echo "- Your original settings were backed up to settings.backup.json"
echo "- The app will use default settings on first run"
echo "- Users can configure their own vault path through Settings"
echo "- Terminal will load with your shell profile (zsh/bash)"