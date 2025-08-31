# Network Tools Hub

A desktop application built with Electron that provides a collection of network administration and diagnostic tools.

## Features

### Current Tools
- **Subnet Calculator** - Calculate network addresses, broadcast addresses, and host ranges for any IP address and subnet mask
  - Support for both CIDR notation and dotted decimal subnet masks
  - IP class identification
  - Binary representation of IP addresses
  - Usable host range calculation

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

### Project Structure

```
electron-test/
├── main.js                 # Main process entry point
├── preload.js             # Preload script for IPC communication
├── landing.html           # Landing page with tool selection
├── landing-renderer.js    # Landing page renderer script
├── subnet-calculator.html # Subnet calculator tool page
├── subnet-renderer.js     # Subnet calculator renderer script
└── forge.config.js        # Electron Forge configuration
```

### Adding New Tools

1. Create a new HTML file for your tool (e.g., `my-tool.html`)
2. Create a corresponding renderer script (e.g., `my-tool-renderer.js`)
3. Add navigation handler in `main.js`:
   ```javascript
   case 'my-tool':
     window.loadFile('my-tool.html')
     break
   ```
4. Update the landing page with a new tool card

## Technology Stack

- **Electron** - Cross-platform desktop application framework
- **Electron Forge** - Build and packaging toolchain
- **HTML/CSS/JavaScript** - Frontend technologies
- **Node.js** - Backend runtime

## Security

This application implements several security best practices:
- Context isolation enabled
- Node integration disabled
- Sandbox mode enabled
- Secure IPC communication via contextBridge
- Content Security Policy headers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

## Author

- **GitHub**: [@gioguarin](https://github.com/gioguarin)

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Packaged with [Electron Forge](https://www.electronforge.io/)