import React, { useState } from 'react'
import { LockIcon, BookIcon, FolderIcon } from './Icons'
import './VaultSetupDialog.css'

interface VaultSetupDialogProps {
  onComplete: (path: string) => void
  onCancel: () => void
}

export const VaultSetupDialog: React.FC<VaultSetupDialogProps> = ({ onComplete, onCancel }) => {
  const [vaultPath, setVaultPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const defaultPath = `${window.electronAPI.platform === 'win32' ? 'C:\\Users\\' : '/Users/'}${window.electronAPI.platform === 'win32' ? 'Username' : 'username'}/Documents/KnowledgeVault`

  const handleBrowse = async () => {
    try {
      const selectedPath = await window.electronAPI.selectFolder()
      if (selectedPath) {
        setVaultPath(selectedPath)
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
    }
  }

  const handleConfirm = async () => {
    if (!vaultPath) {
      // Use default path if none specified
      const defaultVaultPath = await window.electronAPI.getVaultPath()
      await handleSetPath(defaultVaultPath)
    } else {
      await handleSetPath(vaultPath)
    }
  }

  const handleSetPath = async (path: string) => {
    setIsLoading(true)
    try {
      await window.electronAPI.setVaultPath(path)
      onComplete(path)
    } catch (error) {
      console.error('Error setting vault path:', error)
      alert('Failed to set vault path. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="vault-setup-overlay">
      <div className="vault-setup-dialog">
        <div className="vault-setup-header">
          <h2><LockIcon size={24} /> Welcome to Your Knowledge Vault</h2>
          <p>Choose where to store your personal notes and documents</p>
        </div>

        <div className="vault-setup-body">
          <div className="vault-info">
            <div className="info-section">
              <h3><BookIcon size={18} /> Public Docs</h3>
              <p>Shared documentation stored in the repository</p>
              <code>/docs (read-only)</code>
            </div>
            
            <div className="info-section highlight">
              <h3><LockIcon size={18} /> Your Personal Vault</h3>
              <p>Private notes and documents only you can access</p>
              <div className="path-input-group">
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  placeholder={defaultPath}
                  className="vault-path-input"
                />
                <button 
                  className="browse-button"
                  onClick={handleBrowse}
                  disabled={isLoading}
                >
                  <FolderIcon size={16} /> Browse...
                </button>
              </div>
              <small className="help-text">
                Leave empty to use default location: ~/Documents/KnowledgeVault
              </small>
            </div>
          </div>

          <div className="vault-features">
            <h4>Your vault will be used for:</h4>
            <ul>
              <li>Personal notes and documentation</li>
              <li>Private project notes</li>
              <li>Custom templates and snippets</li>
              <li>Draft documents before publishing</li>
            </ul>
          </div>
        </div>

        <div className="vault-setup-footer">
          <button 
            className="cancel-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Create Vault'}
          </button>
        </div>
      </div>
    </div>
  )
}