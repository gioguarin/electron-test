#!/bin/bash

# Build Linux packages using Docker
# This allows building Linux packages on macOS or Windows

echo "🐧 Building Linux packages using Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop to build Linux packages."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Build the Docker image for building Electron apps
echo "🔨 Creating Docker build environment..."

cat > Dockerfile.build << 'EOF'
FROM electronuserland/builder:wine

# Install additional dependencies for building
RUN apt-get update && apt-get install -y \
    dpkg \
    fakeroot \
    rpm \
    git \
    python3 \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /project

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Rebuild native modules for Linux
RUN npx electron-rebuild -f -w node-pty

# Build the application
RUN npm run build

# Build Linux packages
CMD ["npx", "electron-forge", "make", "--platform=linux"]
EOF

echo "📦 Building Docker image..."
docker build -t network-tools-hub-builder -f Dockerfile.build .

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker image"
    exit 1
fi

echo ""
echo "🚀 Building Linux packages..."
docker run --rm -v "$(pwd)/out:/project/out" network-tools-hub-builder

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Linux packages built successfully!"
    echo ""
    echo "📁 Available Linux packages:"
    find out/make -name "*.deb" -o -name "*.rpm" | while read file; do
        echo "  - $file"
    done
else
    echo "❌ Failed to build Linux packages"
    exit 1
fi

# Clean up
rm -f Dockerfile.build

echo ""
echo "🧹 Cleaned up temporary files"
echo ""
echo "📝 Notes:"
echo "  • .deb packages are for Ubuntu/Debian"
echo "  • .rpm packages are for Fedora/Red Hat"
echo "  • Packages are in the out/make directory"