# Network Tools Hub - Supported Platforms

## Overview
Network Tools Hub can be built for all major desktop platforms. Each platform has specific distributables that are created during the build process.

## Supported Platforms

### 🍎 macOS
- **Architectures**: x64 (Intel), arm64 (Apple Silicon/M1/M2)
- **Minimum Version**: macOS 10.15 (Catalina)
- **Distributables**:
  - `.dmg` - Disk image installer (recommended)
  - `.zip` - Compressed archive for manual installation

### 🪟 Windows
- **Architectures**: x64, x86 (32-bit), arm64
- **Minimum Version**: Windows 10
- **Distributables**:
  - `.exe` - Squirrel installer (recommended)
  - `.msi` - Windows Installer (enterprise deployment)
  - `.zip` - Portable version

### 🐧 Linux
- **Architectures**: x64, arm64, armv7l
- **Distributions**: Ubuntu, Debian, Fedora, Red Hat, and others
- **Distributables**:
  - `.deb` - Debian/Ubuntu package
  - `.rpm` - Red Hat/Fedora package
  - `.zip` - Universal archive

## Build Commands

### Build for Current Platform
```bash
npm run make
```

### Build for Specific Platform
```bash
# macOS
npm run make:mac

# Windows
npm run make:win

# Linux
npm run make:linux
```

### Build for All Platforms
```bash
# Using npm script
npm run make:all

# Using build script (recommended)
./build-all-platforms.sh
```

## Output Locations

All built distributables are placed in:
```
out/
├── make/
│   ├── deb/           # Linux .deb packages
│   ├── rpm/           # Linux .rpm packages
│   ├── squirrel.windows/  # Windows installers
│   ├── zip/           # ZIP archives for all platforms
│   └── *.dmg          # macOS disk images
└── Network Tools Hub-{platform}-{arch}/  # Unpacked application
```

## Platform-Specific Features

### Terminal Support
- ✅ **macOS**: Full terminal support with zsh/bash
- ✅ **Windows**: PowerShell and Command Prompt support
- ✅ **Linux**: Bash, zsh, and other shells supported

### Network Tools
All network tools (ping, traceroute, ASN lookup, BGP route server) are supported on all platforms.

### Knowledge Base
The markdown-based knowledge base works identically across all platforms.

## Cross-Platform Building

### Limitations

#### From macOS
- ✅ **macOS apps**: Native support
- ⚠️ **Windows apps**: Requires Wine (may work)
- ❌ **Linux .deb/.rpm**: Cannot build (requires dpkg/fakeroot)
- ✅ **Universal ZIP**: Works for all platforms

#### From Linux
- ✅ **Linux packages**: Native support
- ⚠️ **Windows apps**: Requires Wine (may work)
- ❌ **macOS apps**: Cannot build (requires macOS)
- ✅ **Universal ZIP**: Works for all platforms

#### From Windows
- ✅ **Windows apps**: Native support
- ❌ **macOS apps**: Cannot build (requires macOS)
- ❌ **Linux packages**: Cannot build (requires Linux tools)
- ✅ **Universal ZIP**: Works for all platforms

### Solutions for Cross-Platform Builds

#### Option 1: Universal ZIP Packages (Recommended for Testing)
```bash
# Builds ZIP packages that work on all platforms
./build-universal.sh
```

#### Option 2: Docker for Linux Packages (on macOS/Windows)
```bash
# Requires Docker Desktop
./build-linux-docker.sh
```

#### Option 3: Use CI/CD
Use GitHub Actions or other CI/CD services that provide native runners for each platform.

### Recommendations for Production
For production releases, build on each target platform:
1. Use a macOS machine for macOS builds (.dmg)
2. Use a Windows machine for Windows builds (.exe/.msi)
3. Use a Linux machine for Linux builds (.deb/.rpm)

## Code Signing

### macOS
- Currently disabled for local testing
- Enable in `forge.config.js` by setting `osxSign` configuration
- Requires Apple Developer certificate

### Windows
- Optional but recommended for distribution
- Requires code signing certificate
- Configure in `forge.config.js` under Squirrel maker

### Linux
- Not typically required
- Package signatures handled by distribution repositories

## Testing Builds

### Local Testing
1. Build the application: `npm run make`
2. Navigate to `out/make/`
3. Install and run the appropriate distributable

### CI/CD Testing
Consider using GitHub Actions or similar CI/CD platforms to:
- Build for multiple platforms automatically
- Run tests on each platform
- Create releases automatically

## Troubleshooting

### Terminal Not Working
- Ensure `node-pty` is rebuilt: `npm run rebuild`
- Check that native modules are unpacked in `forge.config.js`

### Build Fails for Target Platform
- Cross-platform builds may fail
- Build on the target platform for best results
- Check that all required build tools are installed

### Missing Icons
- Add platform-specific icons:
  - macOS: `.icns` file
  - Windows: `.ico` file
  - Linux: `.png` file (already configured)