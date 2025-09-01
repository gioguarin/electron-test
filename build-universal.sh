#!/bin/bash

# Build universal ZIP packages for all platforms
# These can be built from any platform without special tools

echo "📦 Building Universal ZIP Packages for All Platforms"
echo "====================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clean and prepare
echo "🧹 Cleaning previous builds..."
rm -rf out/

echo "📦 Installing dependencies..."
npm install

echo "🔧 Rebuilding native modules..."
npm run rebuild

echo "🔨 Building application..."
npm run build

echo ""
echo "Creating universal packages..."
echo "------------------------------"

# Function to create platform package
create_package() {
    local platform=$1
    local arch=$2
    local name=$3
    
    echo ""
    echo "📦 Creating $name package..."
    
    npx electron-forge package --platform=$platform --arch=$arch
    
    if [ $? -eq 0 ]; then
        # Create ZIP manually if forge doesn't
        local app_path="out/Network Tools Hub-$platform-$arch"
        if [ -d "$app_path" ]; then
            echo "  📁 Creating ZIP archive..."
            cd out
            zip -r -q "network-tools-hub-$platform-$arch.zip" "Network Tools Hub-$platform-$arch"
            cd ..
            echo -e "${GREEN}  ✅ Created: out/network-tools-hub-$platform-$arch.zip${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠️  Could not create package for $name${NC}"
    fi
}

# Current platform
CURRENT_PLATFORM=$(uname -s)
CURRENT_ARCH=$(uname -m)

# Determine Electron arch format
if [[ "$CURRENT_ARCH" == "arm64" ]] || [[ "$CURRENT_ARCH" == "aarch64" ]]; then
    ELECTRON_ARCH="arm64"
elif [[ "$CURRENT_ARCH" == "x86_64" ]]; then
    ELECTRON_ARCH="x64"
else
    ELECTRON_ARCH="x64"
fi

echo ""
echo "Building for current platform first..."
echo "Platform: $CURRENT_PLATFORM ($ELECTRON_ARCH)"

if [[ "$CURRENT_PLATFORM" == "Darwin" ]]; then
    create_package "darwin" "$ELECTRON_ARCH" "macOS ($ELECTRON_ARCH)"
    # Also try Intel build on Apple Silicon
    if [[ "$ELECTRON_ARCH" == "arm64" ]]; then
        create_package "darwin" "x64" "macOS (Intel)"
    fi
elif [[ "$CURRENT_PLATFORM" == "Linux" ]]; then
    create_package "linux" "$ELECTRON_ARCH" "Linux ($ELECTRON_ARCH)"
else
    create_package "win32" "$ELECTRON_ARCH" "Windows ($ELECTRON_ARCH)"
fi

# Try other platforms (may not work but worth attempting)
echo ""
echo "Attempting other platforms (may fail - this is normal)..."

if [[ "$CURRENT_PLATFORM" == "Darwin" ]]; then
    create_package "win32" "x64" "Windows (x64)"
    create_package "linux" "x64" "Linux (x64)"
elif [[ "$CURRENT_PLATFORM" == "Linux" ]]; then
    create_package "win32" "x64" "Windows (x64)"
else
    echo -e "${YELLOW}Cross-platform builds from Windows are limited${NC}"
fi

echo ""
echo "========================================="
echo "Build Summary"
echo "========================================="

if [ -d "out" ]; then
    echo ""
    echo "📁 Available packages:"
    echo ""
    
    # List all ZIP files
    find out -name "*.zip" 2>/dev/null | while read file; do
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "  ✅ $file ($size)"
    done
    
    echo ""
    echo -e "${GREEN}✨ Universal packages created!${NC}"
    echo ""
    echo "📝 Notes:"
    echo "  • ZIP files can be distributed to users"
    echo "  • Users can extract and run the application"
    echo "  • No installation required"
    echo "  • Terminal support included"
else
    echo "❌ No packages were created"
fi