# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Electron desktop application project configured with Electron Forge for building and packaging. The app is described as a subnet checker tool.

## Development Commands

### Running the Application
```bash
npm start                # Start the Electron app using Electron Forge
```

### Building and Packaging
```bash
npm run package          # Package the app without creating distributable
npm run make            # Create platform-specific distributables
```

## Architecture

### Core Files
- `main.js`: Main process entry point that creates the BrowserWindow and manages app lifecycle
- `preload.js`: Preload script that runs before the renderer with access to Node.js APIs
- `index.html`: Main renderer process HTML (currently empty, needs implementation)
- `forge.config.js`: Electron Forge configuration for building and packaging

### Build Configuration
The project uses Electron Forge with the following makers configured:
- Squirrel (Windows)
- ZIP (macOS)
- DEB (Linux/Debian)
- RPM (Linux/Red Hat)

Security fuses are enabled to disable dangerous Electron features and enforce running from ASAR archives.

### Dependencies
- Electron v37.4.0
- Electron Forge CLI and plugins for building
- electron-squirrel-startup for Windows installer handling

## Current State
The application has a basic Electron setup but the main functionality (subnet checking) has not been implemented yet. The index.html file is empty and needs the UI implementation.