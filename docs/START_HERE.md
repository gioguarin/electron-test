# START HERE - Network Tools Hub User Guide

Welcome to Network Tools Hub! This guide will help you get started with the application and understand all its features.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Application Layout](#application-layout)
3. [Main Features](#main-features)
4. [Network Tools](#network-tools)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

Network Tools Hub is a comprehensive desktop application for network diagnostics, BGP analysis, and system administration. Built with Electron, it provides a VS Code-like interface with powerful networking capabilities.

### First Launch
When you first open the application, you'll see:
- **Activity Bar** on the left side
- **Main content area** in the center
- **Terminal panel** at the bottom (can be toggled)
- **AI Assistant panel** on the right (can be toggled)

---

## Application Layout

### 1. Activity Bar (Left Side)
The Activity Bar contains icons for different sections:
- **Tools** - Access all network diagnostic tools
- **Knowledge Base** - Browse documentation and guides
- **Settings** - Configure application preferences

### 2. Side Panel
Click on any Activity Bar icon to open the corresponding panel:
- Shows a tree view of available tools or documents
- Click on any item to open it in the main area

### 3. Main Content Area
This is where tools and documents are displayed:
- Each tool opens in its own view
- You can have one tool active at a time

### 4. Terminal Panel (Bottom)
- Toggle with `Ctrl + \`` or click the terminal icon
- Provides a full terminal interface
- Supports standard shell commands
- Automatically uses your system's default shell (zsh on macOS, bash/PowerShell on others)

### 5. AI Assistant Panel (Right)
- Toggle with `Ctrl + Shift + A` or click the AI icon
- Get help with networking questions
- Receive command suggestions
- Learn about tool features

---

## Main Features

### Network Tools

#### 1. **Subnet Calculator**
Calculate network addresses, broadcast addresses, and host ranges.
- Enter an IP address and CIDR notation
- View detailed subnet information
- See binary representations
- Calculate available hosts

#### 2. **BGP Route Server Tool** ⭐ NEW
Connect to Hurricane Electric's route servers worldwide for BGP analysis.

**How to use:**
1. Select a route server location from the dropdown
2. Click "Connect" (automatically authenticates with password: rviews)
3. Choose a command from the dropdown:
   - `show ip bgp <IP>` - View BGP routing info for an IP
   - `show ip bgp summary` - See BGP peer summary
   - `traceroute <host>` - Trace route from that location
4. Enter target IP/hostname (if required)
5. Click "Send Command"

**Available Servers:**
- North America: Seattle, San Jose, Los Angeles, Chicago, Dallas, Toronto, New York, Ashburn, Miami, Denver, Kansas City
- Europe: London, Amsterdam, Frankfurt, Paris, Zurich, Stockholm
- Asia: Hong Kong, Tokyo, Singapore

#### 3. **Ping Tool**
Test network connectivity to hosts.
- Enter hostname or IP address
- Specify ping count
- View real-time results
- See packet loss statistics

#### 4. **Traceroute Tool**
Trace the path packets take to reach a destination.
- Enter target hostname or IP
- View hop-by-hop path
- See latency for each hop
- Identify network bottlenecks

#### 5. **ASN Lookup Tool**
Look up Autonomous System Numbers and BGP information.
- Enter an IP address
- View AS number and organization
- See BGP prefix information
- Get routing details

### Knowledge Base

Browse and edit documentation directly in the application:
- **Markdown support** with syntax highlighting
- **Live preview** as you type
- **File tree navigation**
- **Search functionality** (coming soon)

To access the Knowledge Base:
1. Click the book icon in the Activity Bar
2. Browse the file tree on the left
3. Click any document to view/edit
4. Use the toolbar to save changes or open in system editor

### Settings

Customize your experience:
- **Theme**: Choose between Light, Dark, and High Contrast themes
- **Font Size**: Adjust the interface font size
- **Terminal Settings**: Configure shell preferences
- **Network Defaults**: Set default servers and timeouts

---

## Keyboard Shortcuts

### Essential Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Toggle Sidebar |
| `Ctrl + \`` | Toggle Terminal |
| `Ctrl + Shift + A` | Toggle AI Assistant |
| `Ctrl + ,` | Open Settings |
| `Escape` | Close Settings |

### macOS Variations
On macOS, use `Cmd` instead of `Ctrl` for most shortcuts:
- `Cmd + B` - Toggle Sidebar
- `Cmd + ,` - Open Settings
- `Cmd + Shift + A` - Toggle AI Assistant

---

## Tips and Tricks

### 0. The Knowledgebase is Markdown-based, which means you can open the location of the folder and edit files directly
- Use `#` for main headings
- Use `##` for subheadings
- Use `-` for bullet points
- Use backticks for code snippets

### 1. BGP Route Server Best Practices
- Start with servers geographically close to your target
- Use `show ip bgp summary` first to verify connectivity
- For IPv6, use the `show ipv6 bgp` commands
- The `?` command shows all available commands on the server

### 2. Terminal Usage
- The terminal maintains your session between toggles
- Use it to run local network commands alongside the GUI tools
- Supports copy/paste with standard shortcuts

### 3. Efficient Navigation
- Use keyboard shortcuts to quickly toggle panels
- Keep frequently used tools in the sidebar for quick access
- The main area remembers your last tool selection

### 4. Troubleshooting
- If a tool isn't responding, check the terminal for error messages
- For connection issues, verify your internet connectivity first
- The BGP Route Server requires internet access to reach HE servers

### 5. Working with Multiple Tools
- While you can only view one tool at a time, they continue running in the background
- Use the sidebar to quickly switch between active tools
- Terminal sessions persist when switching tools

---

## Getting Help

### In-App Resources
- **AI Assistant**: Ask questions about networking or the application
- **Knowledge Base**: Browse documentation and guides
- **Help Command**: Type `?` in the BGP Route Server for available commands

### External Resources
- **GitHub Repository**: Report issues and request features
- **Hurricane Electric**: Learn more about BGP and routing at he.net
- **Network Documentation**: IETF RFCs for protocol specifications

---

## Advanced Features

### BGP Analysis Workflows

#### Finding the Best Path to a Destination
1. Connect to a route server near your location
2. Run `show ip bgp <destination-ip>`
3. Note the AS path
4. Connect to route servers in other regions
5. Compare AS paths to understand routing differences

#### Investigating Routing Issues
1. Use `traceroute` from multiple route servers
2. Compare results to identify where packets diverge
3. Use `show ip route` to see the routing table entry
4. Check `show bgp neighbors` to verify peer status

### Custom Workflows
Create your own diagnostic workflows by combining tools:
1. Start with ASN Lookup to identify the target network
2. Use BGP Route Server to check routing from multiple locations
3. Run Traceroute to verify the actual path
4. Use Ping to test connectivity and packet loss

---

## Conclusion

Network Tools Hub combines powerful networking tools with an intuitive interface. Whether you're troubleshooting connectivity issues, analyzing BGP routes, or learning about networking, this application provides the tools you need.

**Remember:**
- Explore all the tools to understand their capabilities
- Use keyboard shortcuts to work more efficiently
- The BGP Route Server tool provides unique insights from global vantage points
- Keep this guide handy as you learn the application


---

*Last updated: August 31st, 2025*
*Version: 1.0.0*