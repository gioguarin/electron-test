import React, { useState, useEffect } from 'react'
import { MarkdownViewer } from './MarkdownViewer'
import { VaultSetupDialog } from './VaultSetupDialog'
import './KnowledgePanel.css'

interface KnowledgePanelProps {
  selectedFile: string | null
  onFileSelect?: (path: string) => void
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ selectedFile, onFileSelect }) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [showVaultSetup, setShowVaultSetup] = useState(false)
  const [vaultChecked, setVaultChecked] = useState(false)
  const [vaultConfigured, setVaultConfigured] = useState<boolean | null>(null)

  const handleNewDocumentSave = async (content: string, fileName?: string) => {
    setIsCreatingNew(false)
    if (fileName && onFileSelect) {
      onFileSelect(fileName)
      // Trigger a refresh of the knowledge tree to show the new file
      // This would need to be passed down from the parent or use a global event
    }
  }

  const handleNewDocumentCancel = () => {
    setIsCreatingNew(false)
    if (onFileSelect) {
      onFileSelect('')  // Clear the selection
    }
  }

  // Handle file selection changes
  useEffect(() => {
    if (selectedFile === '__new__') {
      // When __new__ is selected, always show new document editor
      setIsCreatingNew(true)
    } else if (selectedFile) {
      // When a different file is selected, exit new document mode
      setIsCreatingNew(false)
    }
  }, [selectedFile])

  // Check vault configuration on mount and when creating new document
  useEffect(() => {
    const checkVaultConfiguration = async () => {
      try {
        const settings = await window.electronAPI.loadSettings()
        // Check if vaultPath exists and is not undefined/null
        const isConfigured = settings && settings.vaultPath !== undefined && settings.vaultPath !== null
        setVaultConfigured(isConfigured)
        
        // Show setup dialog when trying to create new document without vault
        if ((isCreatingNew || selectedFile === '__new__') && !isConfigured && !vaultChecked) {
          setShowVaultSetup(true)
          setVaultChecked(true)
        }
      } catch (error) {
        console.error('Error checking vault configuration:', error)
        setVaultConfigured(false)
      }
    }
    checkVaultConfiguration()
    
    // Listen for vault setup request from MarkdownViewer
    const handleShowVaultSetup = () => {
      setShowVaultSetup(true)
    }
    
    window.addEventListener('show-vault-setup', handleShowVaultSetup)
    
    return () => {
      window.removeEventListener('show-vault-setup', handleShowVaultSetup)
    }
  }, [isCreatingNew, selectedFile, vaultChecked])

  const handleVaultSetupComplete = (path: string) => {
    setShowVaultSetup(false)
    setVaultConfigured(true)
    
    // Trigger a custom event to refresh the knowledge explorer
    window.dispatchEvent(new CustomEvent('vault-configured', { detail: { path } }))
    
    // Continue with document creation if that's what triggered the setup
    if (isCreatingNew || selectedFile === '__new__') {
      // Keep the new document state active
    }
  }

  const handleVaultSetupCancel = () => {
    setShowVaultSetup(false)
    setIsCreatingNew(false)
    if (onFileSelect) {
      onFileSelect('')  // Clear the selection
    }
  }

  // Check if we should show new document editor
  // Always prioritize showing new document when __new__ is selected
  const showNewDocument = selectedFile === '__new__' || isCreatingNew

  if (showNewDocument) {
    return (
      <div className="knowledge-panel">
        <MarkdownViewer 
          key="new-document" // Add key to force re-render
          isNewDocument={true}
          initialContent=""
          editable={true}
          onSave={handleNewDocumentSave}
          onCancel={handleNewDocumentCancel}
          onNavigate={onFileSelect}
        />
      </div>
    )
  }

  return (
    <div className="knowledge-panel">
      {showVaultSetup && (
        <VaultSetupDialog
          onComplete={handleVaultSetupComplete}
          onCancel={handleVaultSetupCancel}
        />
      )}
      {selectedFile ? (
        <MarkdownViewer 
          key={selectedFile} // Add key to force re-render when file changes
          filePath={selectedFile}
          editable={true}
          onNavigate={onFileSelect}
        />
      ) : (
        <div className="no-file-selected">
          <div className="empty-state">
            <h2>📚 Knowledge Base</h2>
            {vaultConfigured === false ? (
              // First-time user message
              <>
                <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                  Welcome! Set up your personal knowledge vault to start creating documents.
                </p>
                <button 
                  className="create-document-btn"
                  onClick={() => setShowVaultSetup(true)}
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    fontSize: '16px',
                    padding: '12px 24px',
                    fontWeight: 600
                  }}
                >
                  🚀 Set up Your Vault
                </button>
                <div className="vault-benefits" style={{ marginTop: '30px', textAlign: 'left', maxWidth: '400px', margin: '30px auto' }}>
                  <h3>Your Knowledge Vault includes:</h3>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li>🔐 Private, secure storage for your notes</li>
                    <li>📁 Organized folder structure</li>
                    <li>📝 Markdown editor with live preview</li>
                    <li>🔍 Fast, fuzzy search across all documents</li>
                    <li>📚 Access to public documentation</li>
                  </ul>
                </div>
              </>
            ) : (
              // Configured user message
              <>
                <p>Select a file from the explorer to view its contents</p>
                <button 
                  className="create-document-btn"
                  onClick={() => setIsCreatingNew(true)}
                >
                  📝 Create New Document
                </button>
                <div className="quick-tips">
                  <h3>Quick Tips:</h3>
                  <ul>
                    <li>📁 Navigate through folders in the explorer on the left</li>
                    <li>📄 Click on any markdown file to view it here</li>
                    <li>🔍 Use the search box to quickly find files</li>
                    <li>🕐 Recently modified files show timestamps</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}