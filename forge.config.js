const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Network Tools Hub',
    executableName: 'network-tools-hub',
    icon: './assets/icon.png', // Use PNG for now
    appBundleId: 'com.gioguarin.networktoolshub',
    appCategoryType: 'public.app-category.developer-tools',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'NetworkToolsHub',
        authors: 'Giovanny Guarin',
        exe: 'network-tools-hub.exe',
        description: 'Network Tools Hub - A comprehensive network utility suite',
        // setupIcon: './assets/icon.ico', // Will add when .ico is available
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Giovanny Guarin',
          homepage: 'https://github.com/gioguarin/electron-test',
          icon: './assets/icon.png',
          categories: ['Development', 'Network'],
          description: 'Network Tools Hub - A comprehensive network utility suite',
        },
      },
      platforms: ['linux'],
    },
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
