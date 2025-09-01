# Network Tools Hub

A sophisticated VS Code-inspired Electron desktop application for network administration and diagnostics. Features a modern IDE-style interface with resizable panels, integrated knowledge repository, and powerful network tools.

## 🚀 Key Features

### IDE-Style Interface
- **VS Code-Inspired Layout**: Professional development environment aesthetic
- **Resizable Panels**: Drag to resize any panel with Allotment library
- **Activity Bar Navigation**: Quick access to tools, knowledge base, terminal, and AI assistant
- **Persistent Layout**: Panel sizes and visibility saved between sessions
- **Theme Support**: Dark, Light, and High Contrast themes with real-time switching
- **Custom Title Bar**: Integrated window controls and layout toggles

### Network Tools

#### Subnet Calculator
- Calculate network addresses, broadcast addresses, and host ranges
- Support for both CIDR notation and dotted decimal subnet masks
- IP class identification
- Binary representation of IP addresses
- Usable host range calculation
- Copy results to clipboard
- Calculation history (last 50 calculations)
- Persistent storage using localStorage
- Visual network diagram showing IP ranges
- Support for multiple subnet calculations

#### BGP Route Server
- Connect to public route servers via telnet
- Execute BGP queries and traceroutes from remote locations
- Support for multiple route server connections
- Real-time command output display
- Command history and auto-completion
- Session management with multiple tabs
- Pre-configured list of popular route servers worldwide

### 📚 Knowledge Repository
- **Built-in Documentation Manager**: Browse and edit project documentation directly in the app
- **Markdown Viewer/Editor**: Full markdown support with syntax highlighting
- **Fuzzy Search**: Intelligent file search with Fuse.js showing top 3 matches
- **Live Preview**: See rendered markdown while editing
- **Organized Structure**: 
  - `/knowledge-base/project` - Project documentation
  - `/knowledge-base/documentation` - General docs
  - `/knowledge-base/guides` - How-to guides
  - `/knowledge-base/notes` - Personal notes

### Settings System
- **VS Code-Style Settings**: Comprehensive settings management interface
- **Dual Edit Modes**: Toggle between UI form and direct JSON editing
- **Settings Categories**: 
  - Appearance (theme, font size, font family)
  - Editor (word wrap, tab size, auto-save)
  - Terminal, Panels, Network Tools, Knowledge Base, Keyboard shortcuts
- **Live Preview**: Settings apply immediately as you change them
- **Import/Export**: Direct JSON editing for easy configuration sharing

### Terminal Integration 💻
- **Full Terminal Emulator**: Integrated xterm.js terminal with VS Code theme
- **Multiple Tabs**: Create and manage multiple terminal sessions
- **Cross-Platform Shell**: Automatically uses bash (Mac/Linux) or PowerShell (Windows)
- **Real PTY Support**: Full shell functionality with node-pty
- **Tab Management**: Create, close, and switch between terminals
- **Terminal Actions**: Clear output, kill processes
- **Auto-Resize**: Terminals automatically fit to panel size
- **Web Links**: Clickable URLs in terminal output

### Additional Features
- **AI Assistant Panel**: Ready for LLM integration
- **Component Architecture**: Modular, reusable components with TypeScript
- **React + TypeScript**: Modern frontend stack with React 19
- **Webpack Build System**: Optimized builds for development and production
- **Native Module Support**: Integrated node-pty for terminal functionality
- **Cross-Platform Packaging**: Support for Windows, macOS, and Linux distributions

### Keyboard Shortcuts
- `Ctrl+B` - Toggle sidebar
- `Ctrl+\`` - Toggle terminal
- `Ctrl+Shift+A` - Toggle AI assistant
- `Ctrl+,` - Open settings
- `Escape` - Close settings/dialogs

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

3. Build the application:
```bash
npm run build:dev
```

4. Run the application:
```bash
npm start
```

### Pre-built Packages

Download the latest release from the [Releases](https://github.com/gioguarin/electron-test/releases) page.

#### Windows
- **Installer** (.exe): Double-click to install
- **MSI Package**: For enterprise deployment
- **Portable ZIP**: Extract and run `electron-test.exe`

#### macOS
- **DMG Installer**: Mount and drag to Applications folder
- **ZIP Archive**: Extract and move to Applications

#### Linux
- **DEB Package** (Debian/Ubuntu):
  ```bash
  sudo dpkg -i network-tools-hub_1.0.0_amd64.deb
  ```
- **RPM Package** (Fedora/RHEL):
  ```bash
  sudo rpm -i network-tools-hub-1.0.0.x86_64.rpm
  ```
- **Portable ZIP**:
  ```bash
  unzip electron-test-linux-x64-1.0.0.zip
  cd electron-test-linux-x64
  ./electron-test
  ```

## Development

### Prerequisites
- Node.js (v18 or higher recommended, v14 minimum)
- npm (v9 or higher recommended, v6 minimum)
- Python (for building native modules)
- Build tools:
  - **Windows**: windows-build-tools or Visual Studio 2019/2022
  - **macOS**: Xcode Command Line Tools
  - **Linux**: build-essential, python3, make, g++

### Available Scripts

- `npm start` - Build and start the application (runs build:dev first)
- `npm run start:dev` - Start with development build
- `npm run start:prod` - Start with production build
- `npm run build` - Build for production with webpack
- `npm run build:dev` - Build for development with webpack
- `npm run build:watch` - Watch mode for development
- `npm run compile` - Compile TypeScript files
- `npm run compile:watch` - Watch mode for TypeScript compilation
- `npm run rebuild` - Rebuild native modules (node-pty)
- `npm run rebuild:all` - Full rebuild of all native modules
- `npm run rebuild:windows` - Windows-specific rebuild
- `npm run package` - Package the application without creating distributables
- `npm run make` - Build distributables for your current platform
- `npm run make:mac` - Build macOS distributables
- `npm run make:win` - Build Windows distributables
- `npm run make:linux` - Build Linux distributables
- `npm run make:all` - Build for all platforms
- `npm run make:current` - Build for current platform only
- `npm run dist` - Build and create distributables
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix linting issues
- `npm test` - Run tests (not configured yet)

### Project Structure

```
electron-test/
├── src/
│   ├── main/
│   │   ├── main.js              # Main process entry point
│   │   ├── ipc-handlers.js      # IPC communication handlers
│   │   └── menu.js              # Application menu configuration
│   ├── renderer/
│   │   ├── index.tsx            # React app entry point
│   │   ├── App.tsx              # Main app component with panel layout
│   │   ├── components/          # React components
│   │   │   ├── ActivityBar.tsx  # VS Code-style activity bar
│   │   │   ├── SidePanel.tsx    # Side panel with tool navigation
│   │   │   ├── ToolPanel.tsx    # Tool rendering component
│   │   │   ├── TerminalPanel.tsx # Terminal interface with xterm.js
│   │   │   ├── AssistantPanel.tsx # AI assistant interface
│   │   │   ├── Settings.tsx     # VS Code-style settings component
│   │   │   ├── TitleBar.tsx     # Custom title bar with window controls
│   │   │   ├── HomePage.tsx     # Application home page
│   │   │   ├── NavigationBar.tsx # Navigation controls and breadcrumbs
│   │   │   ├── KnowledgePanel.tsx # Knowledge repository main view
│   │   │   ├── KnowledgeExplorer.tsx # File explorer with fuzzy search
│   │   │   ├── MarkdownViewer.tsx # Markdown viewer/editor
│   │   │   ├── VaultSetupDialog.tsx # Vault configuration dialog
│   │   │   ├── Icons.tsx        # Icon components library
│   │   │   └── tools/           # Network tool components
│   │   │       ├── SubnetCalculatorTool.tsx # Subnet calculator interface
│   │   │       ├── SubnetCalculatorComponent.ts # Subnet calculator logic
│   │   │       ├── BGPRouteServerTool.tsx # BGP route server interface
│   │   │       └── ToolsBase.css # Base styles for tools
│   │   ├── contexts/            # React contexts
│   │   │   ├── PanelContext.tsx # Panel state management
│   │   │   └── NavigationContext.tsx # Navigation history management
│   │   └── styles/              # CSS styles
│   ├── preload/
│   │   └── preload.js           # Preload script with contextBridge
│   ├── components/              # Legacy component system
│   │   ├── base/                # Base component classes
│   │   │   ├── ToolComponent.js # Base tool component
│   │   │   ├── ToolComponent.ts # TypeScript base tool
│   │   │   └── BGPRouteServerComponent.ts # BGP route server base
│   │   ├── tools/               # Tool components
│   │   │   └── SubnetCalculatorComponent.js # Legacy subnet calculator
│   │   └── ToolRegistry.js      # Tool registration system
│   ├── main/                    # Main process modules
│   │   ├── main.js              # Main process entry point
│   │   ├── ipc-handlers.js      # IPC communication handlers
│   │   ├── menu.js              # Application menu configuration
│   │   ├── network-tools.js     # Network tool implementations
│   │   └── terminal.js          # Terminal management
│   └── utils/
│       └── subnet-calculator.js # Subnet calculation business logic
├── knowledge-base/              # Documentation repository
│   ├── project/                 # Project-specific docs
│   ├── documentation/           # General documentation
│   ├── guides/                  # How-to guides
│   └── notes/                   # Personal notes
├── dist/                        # Webpack build output
├── assets/                      # Application icons and images
├── webpack.config.js            # Webpack configuration
├── tsconfig.json                # TypeScript configuration
├── forge.config.js              # Electron Forge configuration
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```

### Architecture Overview

The application uses a modern architecture with:

1. **Main Process** (`src/main/`): Handles window management, IPC communication, and system operations
2. **Renderer Process** (`src/renderer/`): React-based UI with TypeScript
3. **Preload Scripts** (`src/preload/`): Secure bridge between main and renderer
4. **Component System**: Modular, reusable components for tools and UI elements
5. **State Management**: Context-based state for panel visibility and sizes
6. **Build System**: Webpack with separate configurations for main, preload, and renderer

### Adding New Tools

1. Create a new tool component in `src/renderer/components/tools/`
2. Register the tool in `src/renderer/App.tsx`
3. Add IPC handlers if needed in `src/main/ipc-handlers.js`
4. Update the preload script if new APIs are required

### Security

The application follows Electron security best practices:
- Context Isolation enabled
- Node Integration disabled
- Sandbox mode enabled
- Content Security Policy headers
- Secure IPC communication via contextBridge

## Technologies Used

### Core Framework
- **Electron v37.4.0** - Desktop application framework
- **React v19.1.1** - UI library with latest features
- **TypeScript v5.9.2** - Type-safe JavaScript
- **Webpack v5.101.3** - Module bundler with optimizations

### UI Components
- **Allotment v1.20.4** - VS Code-style resizable panel layout
- **React Markdown v10.1.0** - Markdown rendering with GFM support
- **@xterm/xterm v5.5.0** - Full terminal emulator
- **Fuse.js v7.1.0** - Fuzzy search functionality
- **Highlight.js v11.11.1** - Syntax highlighting

### Terminal & System
- **node-pty v1.0.0** - Native pseudoterminal support
- **@xterm/addon-fit** - Terminal auto-resize
- **@xterm/addon-web-links** - Clickable URLs in terminal
- **telnet-client v2.2.6** - Telnet connections for route servers

### Build & Development
- **Electron Forge v7.8.3** - Build, packaging, and distribution
- **electron-rebuild v3.2.9** - Native module rebuilding
- **ESLint v9.34.0** - Code quality and linting
- **electron-log v5.4.3** - Professional logging
- **sharp v0.34.3** - Image processing for icons

## CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows for continuous integration and deployment:

### Automated Workflows
- **CI Pipeline** (`ci.yml`): Runs on every push and pull request
  - Linting with ESLint
  - TypeScript compilation checks
  - Build verification for all platforms
  
- **Build Workflow** (`build.yml`): Cross-platform build automation
  - Builds for Windows, macOS, and Linux
  - Creates distributable packages
  - Uploads artifacts for testing

- **Release Workflow** (`release.yml`): Automated release process
  - Triggered on version tags
  - Creates GitHub releases with built artifacts
  - Supports pre-release and stable releases

- **Security Checks**:
  - Electron security audit (`electron-security-check.yml`)
  - Dependency vulnerability scanning (`dependency-review.yml`)
  - Code review with Claude AI (`claude-code-review.yml`)

### Manual Testing
- **Manual Test Workflow** (`manual-test.yml`): On-demand testing for specific platforms

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all CI checks pass before requesting review

## Future Enhancements

### In Progress
- [x] Terminal integration with node-pty - ✅ Completed
- [x] Multiple terminal tabs support - ✅ Completed
- [x] BGP Route Server tool - ✅ Completed

### Planned Features
- [ ] AI Assistant with LLM integration (OpenAI/Anthropic)
- [ ] Additional network tools:
  - [ ] Ping tool with statistics
  - [ ] Traceroute with visual path mapping
  - [ ] DNS Lookup with record types
  - [ ] Whois lookup
  - [ ] Port scanner
  - [ ] Network packet analyzer
- [ ] Advanced terminal features:
  - [ ] SSH client functionality
  - [ ] Session persistence and restoration
  - [ ] Terminal themes and customization
- [ ] State management improvements:
  - [ ] Redux or Zustand integration
  - [ ] Undo/redo functionality
- [ ] Plugin/extension system
- [ ] Network topology visualization with D3.js
- [ ] Cloud sync for workspace settings and configurations
- [ ] Multi-window support
- [ ] Automated testing suite

## Troubleshooting

### Common Issues

#### Terminal not working
- **Issue**: Terminal shows blank or doesn't respond
- **Solution**: Rebuild node-pty module
  ```bash
  npm run rebuild
  # or for Windows
  npm run rebuild:windows
  ```

#### Build failures on native modules
- **Issue**: Error building node-pty or other native modules
- **Solution**: Ensure you have the required build tools:
  - **Windows**: Install Visual Studio 2019/2022 with C++ workload
  - **macOS**: Install Xcode Command Line Tools: `xcode-select --install`
  - **Linux**: Install build-essential: `sudo apt-get install build-essential python3`

#### Application won't start after packaging
- **Issue**: Packaged app crashes or shows white screen
- **Solution**: Check that all required files are included in the asar archive:
  ```bash
  npm run package -- --no-asar  # Test without asar packaging
  ```

#### Settings not persisting
- **Issue**: Settings reset after app restart
- **Solution**: Check write permissions for app data directory:
  - **Windows**: `%APPDATA%/electron-test`
  - **macOS**: `~/Library/Application Support/electron-test`
  - **Linux**: `~/.config/electron-test`

### Getting Help
- Check the [Issues](https://github.com/gioguarin/electron-test/issues) page for known problems
- Open a new issue with detailed error logs from DevTools console
- Include your OS, Node.js version, and Electron version

## License

ISC License - see LICENSE file for details

## Author

gioguarin

## Acknowledgments

- VS Code for UI/UX inspiration
- Electron community for excellent documentation
- All contributors and users of this project