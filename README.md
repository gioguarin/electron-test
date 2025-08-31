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

#### Ping Tool 🏓
- Test network connectivity to any host
- Configurable packet count
- Real-time output display
- Statistics showing packet loss and RTT (min/avg/max)
- Cross-platform support (Windows/Mac/Linux)
- Copy output to clipboard

#### Traceroute Tool 🗺️
- Trace the path packets take to reach a destination
- Visual hop-by-hop breakdown with response times
- Shows hostname and IP for each hop
- One-click ASN lookup for any hop IP address
- Real-time output display
- Cross-platform traceroute/tracert support

#### ASN Lookup Tool 🌐
- Look up Autonomous System Number information for any IP
- Uses Hurricane Electric's whois service (whois.he.net)
- Alternative BGP lookup via Route Views telnet service
- Shows ASN, network prefix, country, and organization
- IPv4 and IPv6 support
- History of recent lookups saved locally
- Quick lookup from traceroute results

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
- **React + TypeScript**: Modern frontend stack
- **Webpack Build System**: Optimized builds for development and production
- **Hot Module Replacement**: Fast development iteration

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

- `npm start` - Build and start the application (runs build:dev first)
- `npm run start:dev` - Start with development build
- `npm run start:prod` - Start with production build
- `npm run build` - Build for production with webpack
- `npm run build:dev` - Build for development with webpack
- `npm run build:watch` - Watch mode for development
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
│   │   │   ├── KnowledgePanel.tsx # Knowledge repository main view
│   │   │   ├── KnowledgeExplorer.tsx # File explorer with fuzzy search
│   │   │   ├── MarkdownViewer.tsx # Markdown viewer/editor
│   │   │   └── tools/           # Network tool components
│   │   │       ├── PingTool.tsx # Ping tool interface
│   │   │       ├── TracerouteTool.tsx # Traceroute interface
│   │   │       └── ASNLookupTool.tsx # ASN lookup interface
│   │   ├── contexts/            # React contexts
│   │   │   └── PanelContext.tsx # Panel state management
│   │   └── styles/              # CSS styles
│   ├── preload/
│   │   └── preload.js           # Preload script with contextBridge
│   ├── components/              # Legacy component system
│   │   ├── base/                # Base component classes
│   │   └── tools/               # Tool components
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

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **Allotment** - Resizable panel layout (VS Code-style)
- **React Markdown** - Markdown rendering
- **Fuse.js** - Fuzzy search functionality
- **Highlight.js** - Syntax highlighting
- **Electron Forge** - Build and packaging
- **electron-log** - Professional logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Complete terminal integration with node-pty
- [ ] AI Assistant with LLM integration
- [ ] Additional network tools (DNS Lookup, Whois)
- [ ] Redux state management
- [ ] Plugin/extension system
- [ ] Network topology visualization
- [ ] SSH client functionality
- [ ] Cloud sync for workspace settings

## License

ISC License - see LICENSE file for details

## Author

gioguarin

## Acknowledgments

- VS Code for UI/UX inspiration
- Electron community for excellent documentation
- All contributors and users of this project