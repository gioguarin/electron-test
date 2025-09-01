#!/bin/bash

# Script to rebuild native modules for Electron
# This is essential for node-pty to work in packaged apps

echo "🔧 Rebuilding native modules for Electron..."

# Get Electron version from package.json
ELECTRON_VERSION=$(node -p "require('./package.json').devDependencies.electron.replace('^', '')")
ARCH=$(uname -m)

echo "📦 Electron version: $ELECTRON_VERSION"
echo "🖥️  Architecture: $ARCH"

# Clean existing builds
echo "🧹 Cleaning existing builds..."
rm -rf node_modules/node-pty/build
rm -rf node_modules/node-pty/prebuilds

# Rebuild node-pty specifically for Electron
echo "🔨 Rebuilding node-pty for Electron..."
npx electron-rebuild -f -w node-pty -v $ELECTRON_VERSION

# Verify the build
if [ ! -f "node_modules/node-pty/build/Release/pty.node" ]; then
    echo "⚠️  pty.node not found, trying alternative rebuild..."
    cd node_modules/node-pty
    node-gyp rebuild --runtime=electron --target=$ELECTRON_VERSION --arch=$ARCH --dist-url=https://electronjs.org/headers
    cd ../..
fi

# Final verification
if [ -f "node_modules/node-pty/build/Release/pty.node" ]; then
    echo "✅ node-pty successfully built!"
    echo "📍 Binary location: node_modules/node-pty/build/Release/pty.node"
    ls -la node_modules/node-pty/build/Release/pty.node
else
    echo "❌ Failed to build node-pty!"
    exit 1
fi

echo ""
echo "📝 Note: The app is ready to be packaged."
echo "   Run 'npm run make' to create the distributable"