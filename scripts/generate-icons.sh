#!/bin/bash

# Script to generate app icons for different platforms
# Requires ImageMagick: brew install imagemagick

echo "Generating app icons for all platforms..."

# Source icon (should be at least 1024x1024)
SOURCE_ICON="assets/icon-512x512.png"

# Generate Windows .ico file
echo "Creating Windows .ico file..."
convert $SOURCE_ICON -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico

# Generate macOS .icns file
echo "Creating macOS .icns file..."
mkdir -p assets/icon.iconset
convert $SOURCE_ICON -resize 16x16 assets/icon.iconset/icon_16x16.png
convert $SOURCE_ICON -resize 32x32 assets/icon.iconset/icon_16x16@2x.png
convert $SOURCE_ICON -resize 32x32 assets/icon.iconset/icon_32x32.png
convert $SOURCE_ICON -resize 64x64 assets/icon.iconset/icon_32x32@2x.png
convert $SOURCE_ICON -resize 128x128 assets/icon.iconset/icon_128x128.png
convert $SOURCE_ICON -resize 256x256 assets/icon.iconset/icon_128x128@2x.png
convert $SOURCE_ICON -resize 256x256 assets/icon.iconset/icon_256x256.png
convert $SOURCE_ICON -resize 512x512 assets/icon.iconset/icon_256x256@2x.png
convert $SOURCE_ICON -resize 512x512 assets/icon.iconset/icon_512x512.png
iconutil -c icns assets/icon.iconset -o assets/icon.icns
rm -rf assets/icon.iconset

echo "Icon generation complete!"
echo "Generated files:"
echo "  - assets/icon.ico (Windows)"
echo "  - assets/icon.icns (macOS)"
echo "  - assets/icon.png (Linux - already exists)"