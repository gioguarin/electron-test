import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/vs2015.css'
import './MarkdownViewer.css'

interface MarkdownViewerProps {
  filePath: string
  editable?: boolean
  onSave?: (content: string) => void
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ 
  filePath, 
  editable = false,
  onSave 
}) => {
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFile()
  }, [filePath])

  const loadFile = async () => {
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
      await window.electronAPI.saveKnowledgeFile(filePath, editContent)
      setContent(editContent)
      setIsEditing(false)
      if (onSave) {
        onSave(editContent)
      }
    } catch (err) {
      setError(`Failed to save file: ${err}`)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent(content)
  }

  const fileName = filePath.split('/').pop() || filePath

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
        <h2 className="file-name">{fileName}</h2>
        <div className="viewer-actions">
          {editable && !isEditing && (
            <button className="edit-button" onClick={handleEdit}>
              ✏️ Edit
            </button>
          )}
          {isEditing && (
            <>
              <button className="save-button" onClick={handleSave}>
                💾 Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                ❌ Cancel
              </button>
            </>
          )}
          <button 
            className="refresh-button" 
            onClick={loadFile}
            disabled={isEditing}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div className="viewer-content">
        {isEditing ? (
          <div className="editor-container">
            <textarea
              className="markdown-editor"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter markdown content..."
              spellCheck={false}
            />
            <div className="editor-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {editContent}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom link handler to open external links
                a: ({ href, children }) => {
                  const isExternal = href?.startsWith('http')
                  return (
                    <a 
                      href={href}
                      onClick={(e) => {
                        if (isExternal) {
                          e.preventDefault()
                          window.electronAPI.openExternal(href)
                        }
                      }}
                      className={isExternal ? 'external-link' : 'internal-link'}
                    >
                      {children}
                    </a>
                  )
                },
                // Style code blocks
                code: ({ inline, className, children }) => {
                  if (inline) {
                    return <code className="inline-code">{children}</code>
                  }
                  return (
                    <code className={className}>
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