const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = [
  // Main process configuration
  {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/main/main.js',
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js'
    },
    node: {
      __dirname: false,
      __filename: false
    },
    externals: {
      'node-pty': 'commonjs2 node-pty'
    }
  },
  // Preload script configuration
  {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/preload/preload.js',
    target: 'electron-preload',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'preload.js'
    }
  },
  // Renderer process configuration (React app)
  {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/renderer/index.tsx',
    target: 'web', // Changed to 'web' to avoid Node.js dependencies
    devtool: isDevelopment ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@styles': path.resolve(__dirname, 'src/styles')
      },
      fallback: {
        // Provide empty modules for Node.js core modules used by react-markdown
        "path": false,
        "fs": false,
        "stream": false,
        "util": false,
        "buffer": false,
        "process": false,
        "events": false,
        "url": false,
        "assert": false,
        "crypto": false,
        "http": false,
        "https": false,
        "os": false,
        "zlib": false
      }
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'renderer.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html'
      })
    ]
  }
]