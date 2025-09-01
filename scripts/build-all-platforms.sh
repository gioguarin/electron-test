#!/bin/bash

# Build Network Tools Hub for all platforms
# Note: Cross-compilation has limitations. For best results, build on each target platform.

echo "🚀 Building Network Tools Hub for all platforms..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current platform
CURRENT_PLATFORM=$(uname -s)
CURRENT_ARCH=$(uname -m)

echo "📍 Current system: $CURRENT_PLATFORM ($CURRENT_ARCH)"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Rebuild native modules
echo "🔧 Rebuilding native modules..."
npm run rebuild

# Build the application
echo "🔨 Building application..."
npm run build

# Function to build for a specific platform
build_platform() {
    local platform=$1
    local name=$2
    
    echo ""
    echo "📦 Building for $name..."
    
    if npm run make:$platform; then
        echo -e "${GREEN}✅ Successfully built for $name${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to build for $name (this is normal for cross-platform builds)${NC}"
    fi
}

# Build for current platform first
echo ""
echo "========================================="
echo "Building for current platform"
echo "========================================="

if [[ "$CURRENT_PLATFORM" == "Darwin" ]]; then
    build_platform "mac" "macOS"
elif [[ "$CURRENT_PLATFORM" == "Linux" ]]; then
    build_platform "linux" "Linux"
else
    build_platform "win" "Windows"
fi

# Attempt cross-platform builds
echo ""
echo "========================================="
echo "Cross-platform build information"
echo "========================================="

if [[ "$CURRENT_PLATFORM" == "Darwin" ]]; then
    echo -e "${YELLOW}On macOS, you can only build:${NC}"
    echo "  ✅ macOS apps (native)"
    echo "  ✅ Windows apps (via Wine if installed)"
    echo "  ❌ Linux packages (.deb/.rpm) - requires Linux"
    echo ""
    echo "Attempting Windows build..."
    build_platform "win" "Windows"
    echo ""
    echo -e "${YELLOW}Note: Linux packages cannot be built on macOS.${NC}"
    echo "To build Linux packages, use a Linux machine or Docker."
elif [[ "$CURRENT_PLATFORM" == "Linux" ]]; then
    echo -e "${YELLOW}On Linux, you can only build:${NC}"
    echo "  ✅ Linux packages (native)"
    echo "  ✅ Windows apps (via Wine if installed)"
    echo "  ❌ macOS apps - requires macOS"
    echo ""
    echo "Attempting Windows build..."
    build_platform "win" "Windows"
    echo ""
    echo -e "${YELLOW}Note: macOS apps cannot be built on Linux.${NC}"
else
    echo -e "${YELLOW}On Windows, you can only build:${NC}"
    echo "  ✅ Windows apps (native)"
    echo "  ❌ macOS apps - requires macOS"
    echo "  ❌ Linux packages - requires Linux"
    echo ""
    echo -e "${YELLOW}Note: macOS and Linux apps cannot be built on Windows.${NC}"
fi

echo ""
echo "========================================="
echo "Build Summary"
echo "========================================="

if [ -d "out/make" ]; then
    echo ""
    echo "📁 Available builds in out/make/:"
    echo ""
    
    # List all created artifacts
    find out/make -type f \( -name "*.dmg" -o -name "*.zip" -o -name "*.deb" -o -name "*.rpm" -o -name "*.exe" -o -name "*.msi" \) -exec ls -lh {} \; 2>/dev/null | while read line; do
        echo "  $line"
    done
    
    echo ""
    echo -e "${GREEN}✨ Build process complete!${NC}"
else
    echo -e "${RED}❌ No builds were created. Please check the errors above.${NC}"
fi

echo ""
echo "📝 Platform-specific notes:"
echo "  • macOS: DMG and ZIP files created"
echo "  • Windows: EXE installer and ZIP files created"
echo "  • Linux: DEB (Ubuntu/Debian), RPM (RedHat/Fedora), and ZIP files created"
echo ""
echo "⚠️  Important:"
echo "  • Terminal functionality requires platform-specific builds"
echo "  • For production releases, build on each target platform"
echo "  • Windows builds from macOS/Linux may require Wine"
echo "  • macOS builds from Windows/Linux require macOS"