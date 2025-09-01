const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/{docs/**/*,settings.default.json,node_modules/node-pty/**/*,node_modules/node-pty/build/Release/**/*}',
    },
    name: 'Network Tools Hub',
    productName: 'Network Tools Hub',
    executableName: 'electron-test', // Must match package.json name for Linux compatibility
    icon: './assets/icon.png', // Use PNG for now
    appBundleId: 'com.gioguarin.networktoolshub',
    appCategoryType: 'public.app-category.developer-tools',
    osxSign: false, // Disable signing for local testing
    osxNotarize: false, // Disable for now, enable when you have Apple Developer account
  },
  rebuildConfig: {
    force: true,
    modules: ['node-pty'],
    onlyModules: ['node-pty'],
  },
  makers: [
    // Windows - Squirrel installer (.exe)
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'NetworkToolsHub',
        authors: 'Giovanny Guarin',
        exe: 'electron-test.exe',
        description: 'Network Tools Hub - A comprehensive network utility suite',
        // setupIcon: './assets/icon.ico', // Will add when .ico is available
        noMsi: false, // Also create MSI installer
      },
      platforms: ['win32'],
    },
    // Cross-platform ZIP archive
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32'],
    },
    // Linux - Debian/Ubuntu (.deb)
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Giovanny Guarin',
          homepage: 'https://github.com/gioguarin/electron-test',
          icon: './assets/icon.png',
          categories: ['Development', 'Network'],
          description: 'Network Tools Hub - A comprehensive network utility suite',
          productName: 'Network Tools Hub',
          genericName: 'Network Tools',
          name: 'network-tools-hub',
          bin: 'network-tools-hub',
        },
      },
      platforms: ['linux'],
    },
    // Linux - Red Hat/Fedora (.rpm)
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/gioguarin/electron-test',
          icon: './assets/icon.png',
          categories: ['Development', 'Network'],
          description: 'Network Tools Hub - A comprehensive network utility suite',
          productName: 'Network Tools Hub',
          license: 'ISC',
          name: 'network-tools-hub',
          bin: 'network-tools-hub',
        },
      },
      platforms: ['linux'],
    },
    // macOS - DMG installer
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        // icon: './assets/icon.icns', // Will add when .icns is available
        overwrite: true,
        name: 'Network Tools Hub',
      },
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}
