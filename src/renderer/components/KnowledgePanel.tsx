import React from 'react'
import { MarkdownViewer } from './MarkdownViewer'
import './KnowledgePanel.css'

interface KnowledgePanelProps {
  selectedFile: string | null
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ selectedFile }) => {
  return (
    <div className="knowledge-panel">
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
                <li>📁 Navigate through folders in the explorer on the left</li>
                <li>📄 Click on any markdown file to view it here</li>
                <li>🔍 Use the search box to quickly find files</li>
                <li>🕐 Recently modified files show timestamps</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}