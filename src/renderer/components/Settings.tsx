import React, { useState, useEffect } from 'react'
import { GearIcon, DocumentIcon, TerminalIcon, NetworkIcon, BookIcon, LockIcon } from './Icons'
import './Settings.css'

interface SettingsProps {
  onClose?: () => void
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<any>({})
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeCategory, setActiveCategory] = useState('appearance')

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    // Apply theme on mount and when settings change
    const theme = settings.appearance?.theme || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    
    // Apply font size
    if (settings.appearance?.fontSize) {
      document.documentElement.style.setProperty('--base-font-size', `${settings.appearance.fontSize}px`)
    }
  }, [settings.appearance?.theme, settings.appearance?.fontSize])

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.electronAPI.loadSettings()
      setSettings(loadedSettings)
      setJsonText(JSON.stringify(loadedSettings, null, 2))
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async () => {
    try {
      if (jsonMode) {
        // Validate JSON first
        try {
          const parsed = JSON.parse(jsonText)
          await window.electronAPI.saveSettings(parsed)
          setSettings(parsed)
          setJsonError(null)
        } catch (e) {
          setJsonError('Invalid JSON: ' + (e as Error).message)
          return
        }
      } else {
        await window.electronAPI.saveSettings(settings)
        setJsonText(JSON.stringify(settings, null, 2))
      }
      setHasChanges(false)
      
      // Apply settings immediately
      applySettings(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const applySettings = (newSettings: any) => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', newSettings.appearance?.theme || 'dark')
    
    // Apply font size
    if (newSettings.appearance?.fontSize) {
      document.documentElement.style.setProperty('--base-font-size', `${newSettings.appearance.fontSize}px`)
    }
    
    // Apply other settings as needed
  }

  const handleSettingChange = (category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    }
    setSettings(newSettings)
    setHasChanges(true)
  }

  const handleJsonChange = (value: string) => {
    setJsonText(value)
    setHasChanges(true)
    
    // Try to parse to check for errors
    try {
      JSON.parse(value)
      setJsonError(null)
    } catch (e) {
      setJsonError('Invalid JSON: ' + (e as Error).message)
    }
  }

  const resetToDefaults = async () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      await window.electronAPI.resetSettings()
      await loadSettings()
      setHasChanges(false)
    }
  }

  const categories = [
    { id: 'appearance', label: 'Appearance', icon: 'gear' },
    { id: 'editor', label: 'Editor', icon: 'document' },
    { id: 'terminal', label: 'Terminal', icon: 'terminal' },
    { id: 'panels', label: 'Panels', icon: 'gear' },
    { id: 'network', label: 'Network Tools', icon: 'network' },
    { id: 'knowledge', label: 'Knowledge Base', icon: 'book' },
    { id: 'keyboard', label: 'Keyboard', icon: 'gear' },
    { id: 'advanced', label: 'Advanced', icon: 'gear' }
  ]
  
  const renderCategoryIcon = (iconName: string) => {
    switch(iconName) {
      case 'gear': return <GearIcon size={16} />
      case 'document': return <DocumentIcon size={16} />
      case 'terminal': return <TerminalIcon size={16} />
      case 'network': return <NetworkIcon size={16} />
      case 'book': return <BookIcon size={16} />
      default: return null
    }
  }

  const renderSettingsUI = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <div className="settings-group">
            <h3>Appearance Settings</h3>
            
            <div className="setting-item">
              <label>Theme</label>
              <select 
                value={settings.appearance?.theme || 'dark'}
                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="high-contrast">High Contrast</option>
                <option value="hacker-orange">Hacker Orange</option>
                <option value="hacker-green">Hacker Green</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Font Size</label>
              <input 
                type="number" 
                min="10" 
                max="20"
                value={settings.appearance?.fontSize || 13}
                onChange={(e) => handleSettingChange('appearance', 'fontSize', parseInt(e.target.value))}
              />
            </div>

            <div className="setting-item">
              <label>Font Family</label>
              <input 
                type="text"
                value={settings.appearance?.fontFamily || ''}
                onChange={(e) => handleSettingChange('appearance', 'fontFamily', e.target.value)}
              />
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.appearance?.showActivityBarLabels || false}
                  onChange={(e) => handleSettingChange('appearance', 'showActivityBarLabels', e.target.checked)}
                />
                Show Activity Bar Labels
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.appearance?.compactMode || false}
                  onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                />
                Compact Mode
              </label>
            </div>
          </div>
        )

      case 'editor':
        return (
          <div className="settings-group">
            <h3>Editor Settings</h3>
            
            <div className="setting-item">
              <label>Word Wrap</label>
              <select 
                value={settings.editor?.wordWrap || 'on'}
                onChange={(e) => handleSettingChange('editor', 'wordWrap', e.target.value)}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="wordWrapColumn">At Column</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Tab Size</label>
              <input 
                type="number" 
                min="1" 
                max="8"
                value={settings.editor?.tabSize || 2}
                onChange={(e) => handleSettingChange('editor', 'tabSize', parseInt(e.target.value))}
              />
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.editor?.insertSpaces || true}
                  onChange={(e) => handleSettingChange('editor', 'insertSpaces', e.target.checked)}
                />
                Insert Spaces
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.editor?.formatOnSave || false}
                  onChange={(e) => handleSettingChange('editor', 'formatOnSave', e.target.checked)}
                />
                Format On Save
              </label>
            </div>

            <div className="setting-item">
              <label>Auto Save</label>
              <select 
                value={settings.editor?.autoSave || 'off'}
                onChange={(e) => handleSettingChange('editor', 'autoSave', e.target.value)}
              >
                <option value="off">Off</option>
                <option value="afterDelay">After Delay</option>
                <option value="onFocusChange">On Focus Change</option>
              </select>
            </div>
          </div>
        )

      case 'panels':
        return (
          <div className="settings-group">
            <h3>Panel Settings</h3>
            
            <div className="setting-item">
              <label>Default Layout</label>
              <select 
                value={settings.panels?.defaultLayout || 'full'}
                onChange={(e) => handleSettingChange('panels', 'defaultLayout', e.target.value)}
              >
                <option value="full">Full</option>
                <option value="minimal">Minimal</option>
                <option value="focus">Focus Mode</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Sidebar Position</label>
              <select 
                value={settings.panels?.sidebarPosition || 'left'}
                onChange={(e) => handleSettingChange('panels', 'sidebarPosition', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.panels?.autoHideSidebar || false}
                  onChange={(e) => handleSettingChange('panels', 'autoHideSidebar', e.target.checked)}
                />
                Auto Hide Sidebar
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.panels?.rememberPanelSizes || true}
                  onChange={(e) => handleSettingChange('panels', 'rememberPanelSizes', e.target.checked)}
                />
                Remember Panel Sizes
              </label>
            </div>
          </div>
        )

      case 'knowledge':
        return (
          <div className="settings-group">
            <h3>Knowledge Base Settings</h3>
            
            <div className="setting-item">
              <label>Personal Vault Location</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  value={settings.vaultPath || ''}
                  onChange={(e) => {
                    setSettings({...settings, vaultPath: e.target.value})
                    setHasChanges(true)
                  }}
                  placeholder="e.g., /Users/username/Documents/KnowledgeVault"
                  style={{ flex: 1 }}
                />
                <button 
                  className="browse-button"
                  onClick={async () => {
                    // We'll need to add this IPC handler
                    const result = await window.electronAPI.selectFolder?.()
                    if (result) {
                      setSettings({...settings, vaultPath: result})
                      setHasChanges(true)
                    }
                  }}
                  style={{ padding: '6px 12px' }}
                >
                  Browse...
                </button>
              </div>
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                Your personal vault stores your private notes and documents. Public docs are in the /docs folder.
              </small>
            </div>

            <div className="setting-item">
              <label>Current Paths</label>
              <div style={{ 
                padding: '8px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                <div><BookIcon size={14} /> Public Docs: /docs (repository)</div>
                <div><LockIcon size={14} /> Personal Vault: {settings.vaultPath || '~/Documents/KnowledgeVault (default)'}</div>
              </div>
            </div>

            <div className="setting-item">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="action-button"
                  onClick={() => window.electronAPI.openKnowledgeFolder('vault')}
                  style={{ flex: 1 }}
                >
                  <LockIcon size={16} /> Open My Vault
                </button>
                <button 
                  className="action-button"
                  onClick={() => window.electronAPI.openKnowledgeFolder('docs')}
                  style={{ flex: 1 }}
                >
                  <BookIcon size={16} /> Open Public Docs
                </button>
              </div>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.knowledge?.autoSave || false}
                  onChange={(e) => handleSettingChange('knowledge', 'autoSave', e.target.checked)}
                />
                Auto-save documents while editing
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.knowledge?.showRecentFiles || true}
                  onChange={(e) => handleSettingChange('knowledge', 'showRecentFiles', e.target.checked)}
                />
                Show recently modified files
              </label>
            </div>
          </div>
        )

      default:
        return (
          <div className="settings-group">
            <h3>{categories.find(c => c.id === activeCategory)?.label} Settings</h3>
            <p className="settings-placeholder">Settings for this category coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <div className="settings-header-controls">
          <button 
            className={`settings-mode-toggle ${!jsonMode ? 'active' : ''}`}
            onClick={() => setJsonMode(false)}
            title="UI Mode"
          >
            <GearIcon size={16} /> UI
          </button>
          <button 
            className={`settings-mode-toggle ${jsonMode ? 'active' : ''}`}
            onClick={() => setJsonMode(true)}
            title="JSON Mode"
          >
            {} JSON
          </button>
          {onClose && (
            <button className="settings-close" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      <div className="settings-body">
        {!jsonMode ? (
          <>
            <div className="settings-sidebar">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`settings-category ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{renderCategoryIcon(category.icon)}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
            
            <div className="settings-content">
              {renderSettingsUI()}
            </div>
          </>
        ) : (
          <div className="settings-json-editor">
            {jsonError && (
              <div className="json-error">
                {jsonError}
              </div>
            )}
            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
              placeholder="Enter valid JSON configuration..."
            />
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button className="settings-reset" onClick={resetToDefaults}>
          Reset to Defaults
        </button>
        <div className="settings-actions">
          {hasChanges && (
            <span className="unsaved-indicator">● Unsaved changes</span>
          )}
          <button 
            className="settings-save"
            onClick={saveSettings}
            disabled={!hasChanges || !!jsonError}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}