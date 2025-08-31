import React, { useState } from 'react'
import { Allotment } from 'allotment'
import { KnowledgeExplorer } from './KnowledgeExplorer'
import { MarkdownViewer } from './MarkdownViewer'
import './KnowledgePanel.css'

export const KnowledgePanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [explorerWidth, setExplorerWidth] = useState(250)

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
  }

  const handleSizeChange = (sizes: number[] | undefined) => {
    if (sizes && sizes[0]) {
      setExplorerWidth(sizes[0])
    }
  }

  return (
    <div className="knowledge-panel">
      <Allotment onChange={handleSizeChange}>
        <Allotment.Pane minSize={200} maxSize={400} preferredSize={explorerWidth}>
          <KnowledgeExplorer 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile || undefined}
          />
        </Allotment.Pane>
        
        <Allotment.Pane>
          {selectedFile ? (
            <MarkdownViewer 
              filePath={selectedFile}
              editable={true}
            />
          ) : (
            <div className="no-file-selected">
              <div className="empty-state">
                <h2>📚 Knowledge Base</h2>
                <p>Select a file from the explorer to view its contents</p>
                <div className="quick-tips">
                  <h3>Quick Tips:</h3>
                  <ul>
                    <li>📁 Navigate through folders in the explorer</li>
                    <li>📄 Click on any markdown file to view it</li>
                    <li>✏️ Edit files directly in the viewer</li>
                    <li>🔍 Use search to find specific files</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Allotment.Pane>
      </Allotment>
    </div>
  )
}