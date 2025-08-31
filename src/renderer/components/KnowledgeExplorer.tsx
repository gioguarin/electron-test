import React, { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { VaultSetupDialog } from './VaultSetupDialog'
import { FolderIcon, FolderOpenIcon, DocumentIcon, RefreshIcon, PlusIcon, LockIcon, RocketIcon } from './Icons'
import './KnowledgeExplorer.css'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  expanded?: boolean
  parent?: string
  lastModified?: string
  isPublic?: boolean
  isUserVault?: boolean
}

interface SearchResult {
  item: FileNode
  score?: number
  matches?: readonly any[]
}

interface KnowledgeExplorerProps {
  onFileSelect: (path: string) => void
  selectedFile?: string
  onCreateNew?: () => void
}

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({ 
  onFileSelect, 
  selectedFile,
  onCreateNew 
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [allFiles, setAllFiles] = useState<FileNode[]>([])
  const [vaultConfigured, setVaultConfigured] = useState<boolean | null>(null)
  const [showVaultSetup, setShowVaultSetup] = useState(false)

  useEffect(() => {
    checkVaultConfiguration()
    loadFileTree()
    
    // Listen for vault configuration events from other components
    const handleVaultConfigured = async (event: CustomEvent) => {
      console.log('Vault configured event received:', event.detail)
      setVaultConfigured(true)
      await loadFileTree()
    }
    
    window.addEventListener('vault-configured', handleVaultConfigured as EventListener)
    
    return () => {
      window.removeEventListener('vault-configured', handleVaultConfigured as EventListener)
    }
  }, [])

  const checkVaultConfiguration = async () => {
    try {
      const settings = await window.electronAPI.loadSettings()
      // Check if vaultPath exists and is not undefined/null
      const hasVault = settings && settings.vaultPath !== undefined && settings.vaultPath !== null
      setVaultConfigured(hasVault)
      console.log('Vault configuration check:', { settings, hasVault })
    } catch (error) {
      console.error('Error checking vault configuration:', error)
      setVaultConfigured(false)
    }
  }

  const handleVaultSetup = () => {
    setShowVaultSetup(true)
  }

  const handleVaultSetupComplete = async (path: string) => {
    setShowVaultSetup(false)
    setVaultConfigured(true)
    // Reload the file tree to show the new vault
    await loadFileTree()
    
    // Also emit the event in case other components need to know
    window.dispatchEvent(new CustomEvent('vault-configured', { detail: { path } }))
  }

  const handleVaultSetupCancel = () => {
    setShowVaultSetup(false)
  }

  // Helper function to flatten the file tree for searching
  const flattenTree = (nodes: FileNode[], parent = ''): FileNode[] => {
    let files: FileNode[] = []
    for (const node of nodes) {
      const nodeWithParent = { ...node, parent }
      if (node.type === 'file') {
        files.push(nodeWithParent)
      }
      if (node.children) {
        files = files.concat(flattenTree(node.children, node.path))
      }
    }
    return files
  }

  const loadFileTree = async () => {
    try {
      const tree = await window.electronAPI.getKnowledgeTree()
      setFileTree(tree)
      
      // Flatten tree for searching
      const flatFiles = flattenTree(tree)
      setAllFiles(flatFiles)
      
      // Auto-expand first level (including My Vault and Public Docs)
      const firstLevel = new Set<string>()
      tree.forEach((node: FileNode) => {
        if (node.type === 'directory') {
          firstLevel.add(node.path)
          // Also expand My Vault by default to show user's files
          if (node.path === 'vault' || node.path === 'docs') {
            firstLevel.add(node.path)
          }
        }
      })
      setExpandedNodes(firstLevel)
    } catch (error) {
      console.error('Failed to load knowledge tree:', error)
    }
  }

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allFiles, {
      keys: ['name', 'path'],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true
    })
  }, [allFiles])

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = fuse.search(searchQuery)
      // Get top 3 results
      const topResults = results.slice(0, 3)
      setSearchResults(topResults)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, fuse])

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file') {
      onFileSelect(node.path)
    } else {
      toggleNode(node.path)
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    onFileSelect(result.item.path)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const highlightMatch = (text: string, matches?: any[]) => {
    if (!matches || matches.length === 0) return text
    
    // Simple highlight for first match
    const match = matches[0]
    if (match && match.indices && match.indices.length > 0) {
      const [start, end] = match.indices[0]
      return (
        <>
          {text.slice(0, start)}
          <span className="highlight">{text.slice(start, end + 1)}</span>
          {text.slice(end + 1)}
        </>
      )
    }
    return text
  }

  const formatLastModified = (dateString?: string): { text: string; isRecent: boolean } => {
    if (!dateString) return { text: '', isRecent: false }
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    // Within last 120 minutes - show in minutes
    if (diffMins <= 120) {
      if (diffMins === 0) return { text: 'just now', isRecent: true }
      if (diffMins === 1) return { text: '1 min ago', isRecent: true }
      return { text: `${diffMins} mins ago`, isRecent: true }
    }
    
    // Within last 24 hours - show in hours
    if (diffHours < 24) {
      if (diffHours === 1) return { text: '1 hour ago', isRecent: false }
      return { text: `${diffHours} hours ago`, isRecent: false }
    }
    
    // Within last 7 days - show days
    if (diffDays < 7) {
      if (diffDays === 1) return { text: 'yesterday', isRecent: false }
      return { text: `${diffDays} days ago`, isRecent: false }
    }
    
    // Otherwise show date in MM/DD/YYYY format
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    return { text: `${month}/${day}/${year}`, isRecent: false }
  }

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.path)
    const isSelected = selectedFile === node.path

    const getIcon = () => {
      if (node.type === 'directory') {
        return isExpanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />
      }
      return <DocumentIcon size={16} />
    }

    return (
      <div key={node.path} className="tree-node">
        <div
          className={`tree-node-content ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          <span className="tree-node-icon">{getIcon()}</span>
          <span className="tree-node-name">{node.name}</span>
          {node.type === 'file' && node.lastModified && (() => {
            const timeInfo = formatLastModified(node.lastModified)
            return timeInfo.text ? (
              <span className={`tree-node-time ${timeInfo.isRecent ? 'recent' : ''}`}>
                {timeInfo.text}
              </span>
            ) : null
          })()}
        </div>
        {node.type === 'directory' && isExpanded && (
          <div className="tree-node-children">
            {node.children && node.children.length > 0 ? (
              node.children.map(child => renderNode(child, level + 1))
            ) : (
              <div 
                style={{ 
                  paddingLeft: `${(level + 1) * 20 + 8}px`,
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  padding: '4px 0 4px 0'
                }}
              >
                {node.isUserVault ? 'No documents yet. Create your first!' : 'Empty folder'}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {showVaultSetup && (
        <VaultSetupDialog
          onComplete={handleVaultSetupComplete}
          onCancel={handleVaultSetupCancel}
        />
      )}
      <div className="knowledge-explorer">
      <div className="explorer-header">
        <h3>Knowledge Base</h3>
      </div>
      <div className="explorer-search">
        <input
          type="text"
          placeholder="Search files (fuzzy search)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            <div className="search-results-header">
              Top {searchResults.length} matches:
            </div>
            {searchResults.map((result, index) => (
              <div
                key={result.item.path}
                className="search-result-item"
                onClick={() => handleSearchResultClick(result)}
              >
                <div className="result-rank">#{index + 1}</div>
                <div className="result-content">
                  <div className="result-name">
                    <DocumentIcon size={14} /> {highlightMatch(result.item.name, result.matches?.find(m => m.key === 'name')?.indices)}
                  </div>
                  <div className="result-path">
                    {result.item.parent || 'root'}
                  </div>
                </div>
                <div className="result-score">
                  {result.score ? `${Math.round((1 - result.score) * 100)}%` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
        {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
          <div className="search-results-dropdown">
            <div className="no-results">No files found matching "{searchQuery}"</div>
          </div>
        )}
      </div>
      <div className="explorer-tree">
        {!showSearchResults && (
          <>
            {vaultConfigured === false ? (
              // Show setup prompt in tree area
              <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ marginBottom: '16px' }}><LockIcon size={48} /></div>
                <h3 style={{ marginBottom: '8px' }}>No Vault Configured</h3>
                <p style={{ fontSize: '12px', marginBottom: '16px' }}>
                  Set up your personal vault to start creating and organizing documents.
                </p>
                <button 
                  className="action-button"
                  onClick={handleVaultSetup}
                  style={{ 
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  <RocketIcon size={16} /> Set up Vault
                </button>
              </div>
            ) : (
              <>
                {selectedFile === '__new__' && (
                  <div className="tree-node">
                    <div
                      className="tree-node-content selected new-document"
                      style={{ paddingLeft: '8px' }}
                      onClick={() => onFileSelect('__new__')}
                    >
                      <span className="tree-node-icon"><PlusIcon size={16} /></span>
                      <span className="tree-node-name">New Document (Unsaved)</span>
                      <span className="tree-node-badge">NEW</span>
                    </div>
                  </div>
                )}
                {fileTree.map(node => renderNode(node))}
              </>
            )}
          </>
        )}
      </div>
      <div className="explorer-actions">
        {vaultConfigured === false ? (
          // Show setup button for first-time users
          <button 
            className="action-button setup-vault-button" 
            onClick={handleVaultSetup}
            style={{ 
              width: '100%',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              fontWeight: 600,
              padding: '10px'
            }}
          >
            🚀 Set up Vault
          </button>
        ) : (
          // Show normal actions for configured users
          <>
            <button className="action-button" onClick={loadFileTree} title="Refresh file tree">
              <RefreshIcon size={16} /> <span>Refresh</span>
            </button>
            {onCreateNew && (
              <button className="action-button" onClick={onCreateNew} title="Create new document">
                <PlusIcon size={16} /> <span>New</span>
              </button>
            )}
            <button className="action-button" onClick={() => window.electronAPI.openKnowledgeFolder('vault')} title="Open vault folder">
              <LockIcon size={16} /> <span>Vault</span>
            </button>
          </>
        )}
      </div>
    </div>
    </>
  )
}