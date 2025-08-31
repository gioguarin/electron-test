import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/index.css'

// Create root element if it doesn't exist
let rootElement = document.getElementById('root')
if (!rootElement) {
  rootElement = document.createElement('div')
  rootElement.id = 'root'
  document.body.appendChild(rootElement)
}

// Create React root and render app
const root = ReactDOM.createRoot(rootElement)

// Log version for debugging
console.log('App Version: 2.0 - Fixed Layout')

root.render(
  <App />
)