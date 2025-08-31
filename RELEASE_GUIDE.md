# Network Tools Hub - Release Guide

## Download and Installation

### 🍎 macOS

1. **Download the DMG file** from the [Releases page](https://github.com/gioguarin/electron-test/releases)
   - File: `NetworkToolsHub-macOS-vX.X.X.dmg` or `.zip`

2. **Install**:
   - For DMG: Double-click the DMG file and drag Network Tools Hub to your Applications folder
   - For ZIP: Extract and move to Applications folder

3. **First Run**:
   - macOS may show a security warning since the app isn't notarized
   - Right-click the app and select "Open" to bypass Gatekeeper
   - Or go to System Preferences > Security & Privacy and click "Open Anyway"

### 🪟 Windows

1. **Download the installer** from the [Releases page](https://github.com/gioguarin/electron-test/releases)
   - File: `NetworkToolsHub-Windows-Setup-vX.X.X.exe`

2. **Install**:
   - Run the installer
   - Follow the installation wizard
   - The app will be installed to Program Files

3. **Windows Defender**:
   - You may see a SmartScreen warning
   - Click "More info" and then "Run anyway"

### 🐧 Linux

#### Debian/Ubuntu (.deb)
```bash
# Download the .deb file
wget https://github.com/gioguarin/electron-test/releases/download/vX.X.X/NetworkToolsHub-Linux-vX.X.X.deb

# Install
sudo dpkg -i NetworkToolsHub-Linux-vX.X.X.deb

# Fix dependencies if needed
sudo apt-get install -f
```

#### Other Linux Distributions (.zip)
```bash
# Download the .zip file
wget https://github.com/gioguarin/electron-test/releases/download/vX.X.X/NetworkToolsHub-Linux-vX.X.X.zip

# Extract
unzip NetworkToolsHub-Linux-vX.X.X.zip

# Make executable
chmod +x network-tools-hub

# Run
./network-tools-hub
```

## Creating a New Release

### For Maintainers

1. **Update version in package.json**:
   ```json
   "version": "1.0.1"
   ```

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   ```

3. **Create and push a tag**:
   ```bash
   git tag v1.0.1
   git push origin main
   git push origin v1.0.1
   ```

4. **GitHub Actions will automatically**:
   - Build the app for all platforms
   - Create a GitHub release
   - Upload the built artifacts

### Manual Build (Local)

```bash
# Install dependencies
npm install

# Build for your current platform
npm run make

# Build for specific platforms
npm run make:mac    # macOS
npm run make:win    # Windows  
npm run make:linux  # Linux

# Built files will be in the 'out' directory
```

## System Requirements

### Minimum Requirements
- **macOS**: 10.13 or later
- **Windows**: Windows 10 or later
- **Linux**: Ubuntu 18.04+, Fedora 32+, Debian 10+

### Features
- ✅ Subnet Calculator
- ✅ VLSM Calculator
- ✅ Ping Tool
- ✅ Traceroute Tool
- ✅ ASN/BGP Lookup
- ✅ Integrated Terminal
- ✅ Knowledge Base with Markdown support
- ✅ Dark/Light theme
- ✅ Cross-platform support

## Troubleshooting

### macOS: "App is damaged and can't be opened"
```bash
# Clear quarantine attribute
xattr -cr /Applications/Network\ Tools\ Hub.app
```

### Linux: Missing dependencies
```bash
# Install required libraries
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1
```

### Windows: App won't start
- Install [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
- Run as Administrator if needed

## Support

- **Issues**: [GitHub Issues](https://github.com/gioguarin/electron-test/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gioguarin/electron-test/discussions)

## License

ISC License - See [LICENSE](LICENSE) for details

---
Built with ❤️ by Giovanny Guarin