import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/vs2015.css'
import './MarkdownViewer.css'

interface MarkdownViewerProps {
  filePath?: string
  initialContent?: string
  isNewDocument?: boolean
  editable?: boolean
  onSave?: (content: string, fileName?: string) => void
  onCancel?: () => void
  onNavigate?: (path: string) => void
}

type ViewMode = 'edit' | 'preview' | 'split'

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ 
  filePath, 
  initialContent = '',
  isNewDocument = false,
  editable = false,
  onSave,
  onCancel,
  onNavigate 
}) => {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(isNewDocument)
  const [editContent, setEditContent] = useState(initialContent)
  const [loading, setLoading] = useState(!isNewDocument)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(isNewDocument ? 'split' : 'preview')
  const [newFileName, setNewFileName] = useState('')

  useEffect(() => {
    if (!isNewDocument && filePath) {
      loadFile()
    }
  }, [filePath, isNewDocument])

  // Auto-focus the filename input when creating a new document
  useEffect(() => {
    if (isNewDocument && isEditing) {
      const input = document.querySelector('.file-name-input') as HTMLInputElement
      if (input) {
        input.focus()
      }
    }
  }, [isNewDocument, isEditing])

  const loadFile = async () => {
    if (!filePath) return
    try {
      setLoading(true)
      setError(null)
      const fileContent = await window.electronAPI.readKnowledgeFile(filePath)
      setContent(fileContent)
      setEditContent(fileContent)
    } catch (err) {
      setError(`Failed to load file: ${err}`)
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(content)
  }

  const handleSave = async () => {
    try {
      if (isNewDocument && newFileName) {
        // Save new documents to user vault by default
        const newPath = newFileName.endsWith('.md') ? newFileName : newFileName + '.md'
        const result = await window.electronAPI.saveKnowledgeFile(newPath, editContent)
        if (onSave) {
          // Return the full path with vault prefix
          onSave(editContent, `vault/${newPath}`)
        }
      } else if (filePath) {
        await window.electronAPI.saveKnowledgeFile(filePath, editContent)
        setContent(editContent)
        if (onSave) {
          onSave(editContent)
        }
      }
      setIsEditing(false)
      setViewMode('preview')
    } catch (err) {
      setError(`Failed to save file: ${err}`)
    }
  }

  const handleCancel = () => {
    if (isNewDocument && onCancel) {
      onCancel()
    } else {
      setIsEditing(false)
      setEditContent(content)
    }
  }

  const fileName = isNewDocument ? 'New Document' : (filePath?.split('/').pop() || 'Untitled')

  if (loading) {
    return (
      <div className="markdown-viewer loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="markdown-viewer error">
        <div className="error-message">{error}</div>
        <button onClick={loadFile}>Retry</button>
      </div>
    )
  }

  return (
    <div className="markdown-viewer">
      <div className="viewer-header">
        {isNewDocument && isEditing ? (
          <input
            type="text"
            className="file-name-input"
            placeholder="Enter file name (e.g., my-notes.md)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        ) : (
          <h2 className="file-name">{fileName}</h2>
        )}
        <div className="viewer-actions">
          {isEditing && (
            <>
              <button 
                className={`view-mode-btn ${viewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setViewMode('edit')}
                title="Edit only"
              >
                📝 Edit
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split view"
              >
                📖 Split
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="Preview only"
              >
                👁️ Preview
              </button>
              <span className="divider" />
            </>
          )}
          {editable && !isEditing && (
            <button className="edit-button" onClick={handleEdit}>
              ✏️ Edit
            </button>
          )}
          {isEditing && (
            <>
              <button 
                className="save-button" 
                onClick={handleSave}
                disabled={isNewDocument && !newFileName}
              >
                💾 Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                ❌ Cancel
              </button>
            </>
          )}
          {!isNewDocument && (
            <button 
              className="refresh-button" 
              onClick={loadFile}
              disabled={isEditing}
            >
              🔄 Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="viewer-content">
        {isEditing ? (
          <div className={`editor-container ${viewMode}`}>
            {(viewMode === 'edit' || viewMode === 'split') && (
              <textarea
                className="markdown-editor"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter markdown content..."
                spellCheck={false}
              />
            )}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="editor-preview">
                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {editContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom link handler to open external links and handle internal navigation
                a: ({ href, children }) => {
                  const isExternal = href?.startsWith('http') || href?.startsWith('https')
                  const isMarkdownFile = href?.endsWith('.md')
                  
                  return (
                    <a 
                      href={href}
                      onClick={(e) => {
                        e.preventDefault() // Always prevent default navigation
                        
                        if (isExternal && href) {
                          // Open external links in browser
                          window.electronAPI.openExternal(href)
                        } else if (isMarkdownFile && href && onNavigate) {
                          // Navigate to internal markdown files
                          // Handle relative paths from current file location
                          const currentDir = filePath.substring(0, filePath.lastIndexOf('/'))
                          let targetPath = href
                          
                          // If the link is relative, resolve it from current directory
                          if (!href.startsWith('/')) {
                            if (currentDir) {
                              targetPath = `${currentDir}/${href}`
                            } else {
                              targetPath = href
                            }
                            // Normalize the path (remove ./ and resolve ../)
                            targetPath = targetPath.replace(/\/\.\//, '/')
                            while (targetPath.includes('../')) {
                              targetPath = targetPath.replace(/[^/]+\/\.\.\//, '')
                            }
                          }
                          
                          onNavigate(targetPath)
                        }
                        // For other links (like anchors), do nothing to prevent navigation
                      }}
                      className={isExternal ? 'external-link' : 'internal-link'}
                      style={{ cursor: 'pointer' }}
                    >
                      {children}
                    </a>
                  )
                },
                // Style code blocks
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  
                  if (isInline) {
                    return <code className="inline-code" {...props}>{children}</code>
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}