# Network Tools Hub

A desktop application built with Electron that provides a collection of network administration and diagnostic tools.

## Features

### Current Tools
- **Subnet Calculator** - Calculate network addresses, broadcast addresses, and host ranges for any IP address and subnet mask
  - Support for both CIDR notation and dotted decimal subnet masks
  - IP class identification
  - Binary representation of IP addresses
  - Usable host range calculation
  - Copy results to clipboard
  - Calculation history (last 50 calculations)
  - Persistent storage using localStorage

### Coming Soon
- VLSM Calculator
- Wildcard Mask Calculator
- Ping Tool
- Port Scanner
- DNS Lookup Tool

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/gioguarin/electron-test.git
cd electron-test
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

### Pre-built Packages

Download the latest release from the [Releases](https://github.com/gioguarin/electron-test/releases) page.

#### Linux
- **DEB Package** (Debian/Ubuntu):
  ```bash
  sudo dpkg -i electron-test_1.0.0_amd64.deb
  ```
- **Portable ZIP**:
  ```bash
  unzip electron-test-linux-x64-1.0.0.zip
  cd electron-test-linux-x64
  ./electron-test
  ```

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Available Scripts

- `npm start` - Start the application in development mode
- `npm run package` - Package the application without creating distributables
- `npm run make` - Build distributables for your current platform
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix linting issues

### Project Structure

```
electron-test/
├── src/
│   ├── main/
│   │   ├── main.js              # Main process entry point
│   │   ├── ipc-handlers.js      # IPC communication handlers
│   │   └── menu.js              # Application menu configuration
│   ├── renderer/
│   │   ├── landing.html         # Landing page with tool selection
│   │   ├── landing-renderer.js  # Landing page logic
│   │   ├── styles.css           # Common styles
│   │   └── pages/
│   │       ├── subnet-calculator.html  # Subnet calculator tool
│   │       └── subnet-renderer.js      # Subnet calculator logic
│   ├── preload/
│   │   └── preload.js           # Preload script with contextBridge
│   └── utils/
│       └── subnet-calculator.js # Subnet calculation business logic
├── assets/                      # Application icons and images
├── forge.config.js              # Electron Forge configuration
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```

### Adding New Tools

1. Create a new HTML file in `src/renderer/pages/` (e.g., `my-tool.html`)
2. Create a corresponding renderer script (e.g., `my-tool-renderer.js`)
3. Add navigation handler in `src/main/ipc-handlers.js`:
   ```javascript
   case 'my-tool':
     await window.loadFile(path.join(__dirname, '..', 'renderer', 'pages', 'my-tool.html'))
     break
   ```
4. Update the landing page (`src/renderer/landing.html`) with a new tool card

## Recent Improvements

### Version 1.0.0
- ✅ Restructured project with modular architecture
- ✅ Added professional logging system
- ✅ Created custom application icons
- ✅ Implemented copy-to-clipboard functionality
- ✅ Added persistent calculation history
- ✅ Improved error handling and user feedback
- ✅ Enhanced security with sandboxed preload scripts

## Technology Stack

- **Electron** - Cross-platform desktop application framework
- **Electron Forge** - Build and packaging toolchain
- **HTML/CSS/JavaScript** - Frontend technologies
- **Node.js** - Backend runtime
- **electron-log** - Professional logging system

## Security

This application implements several security best practices:
- Context isolation enabled
- Node integration disabled
- Sandbox mode enabled
- Secure IPC communication via contextBridge
- Content Security Policy headers
- Input validation on both frontend and backend
- Electron Fuses configured for production security

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure
- Add appropriate error handling
- Update documentation for new features
- Test on multiple platforms when possible
- Ensure all security features remain enabled

## Known Issues

- electron-log cannot be used in sandboxed preload scripts (using console logging instead)
- Some features marked as "Coming Soon" are placeholders for future development

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

## Author

- **GitHub**: [@gioguarin](https://github.com/gioguarin)

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Packaged with [Electron Forge](https://www.electronforge.io/)
- Logging powered by [electron-log](https://github.com/megahertz/electron-log)
- Icons generated using modern gradient designs