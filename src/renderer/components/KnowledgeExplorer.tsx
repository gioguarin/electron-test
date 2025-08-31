import React, { useState, useEffect } from 'react'
import './KnowledgeExplorer.css'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  expanded?: boolean
}

interface KnowledgeExplorerProps {
  onFileSelect: (path: string) => void
  selectedFile?: string
}

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({ 
  onFileSelect, 
  selectedFile 
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFileTree()
  }, [])

  const loadFileTree = async () => {
    try {
      const tree = await window.electronAPI.getKnowledgeTree()
      setFileTree(tree)
      // Auto-expand first level
      const firstLevel = new Set<string>()
      tree.forEach(node => {
        if (node.type === 'directory') {
          firstLevel.add(node.path)
        }
      })
      setExpandedNodes(firstLevel)
    } catch (error) {
      console.error('Failed to load knowledge tree:', error)
    }
  }

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

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.path)
    const isSelected = selectedFile === node.path
    const matchesSearch = searchQuery === '' || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch && node.type === 'file') {
      return null
    }

    const getIcon = () => {
      if (node.type === 'directory') {
        return isExpanded ? '📂' : '📁'
      }
      return '📄'
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
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div className="tree-node-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="knowledge-explorer">
      <div className="explorer-header">
        <h3>Knowledge Base</h3>
      </div>
      <div className="explorer-search">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="explorer-tree">
        {fileTree.map(node => renderNode(node))}
      </div>
      <div className="explorer-actions">
        <button className="action-button" onClick={loadFileTree}>
          🔄 Refresh
        </button>
        <button className="action-button" onClick={() => window.electronAPI.openKnowledgeFolder()}>
          📁 Open Folder
        </button>
      </div>
    </div>
  )
}