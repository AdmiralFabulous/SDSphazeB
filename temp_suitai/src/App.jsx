import { useState } from 'react'
import './App.css'
import FileInput from './components/FileInput'

function App() {
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile)
    setUploadStatus(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `File "${file.name}" uploaded successfully!`,
        })
        setFile(null)
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Upload failed. Please try again.',
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error: ${error.message}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SUIT AI Runner - File Input Component</h1>
        <p className="subtitle">RUNNER-E02-S02-T02: Implement File Input</p>
      </header>

      <main className="app-main">
        <section className="demo-section">
          <h2>File Upload Demo</h2>

          <div className="form-group">
            <FileInput
              label="Upload Document"
              value={file}
              onChange={handleFileChange}
              accept=".pdf,.docx,.xlsx,.txt"
              maxSize={5 * 1024 * 1024}
              required={true}
              helpText="Supported formats: PDF, Word, Excel, Text"
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="file-preview">
              <h3>Selected File:</h3>
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
              <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            {file && (
              <button
                className="clear-btn"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Clear Selection
              </button>
            )}
          </div>

          {uploadStatus && (
            <div className={`status-message ${uploadStatus.type}`}>
              {uploadStatus.message}
            </div>
          )}
        </section>

        <section className="info-section">
          <h2>Component Features</h2>
          <ul>
            <li>✅ Drag-and-drop file upload</li>
            <li>✅ File type validation (MIME types and extensions)</li>
            <li>✅ File size constraints</li>
            <li>✅ Full keyboard accessibility</li>
            <li>✅ ARIA labels and semantic HTML</li>
            <li>✅ Responsive design</li>
            <li>✅ Dark mode support</li>
            <li>✅ Error handling and validation messages</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Usage Example</h2>
          <pre><code>{`import { useState } from 'react';
import FileInput from './components/FileInput';

function App() {
  const [file, setFile] = useState(null);

  return (
    <FileInput
      label="Upload Document"
      value={file}
      onChange={setFile}
      accept=".pdf"
      maxSize={5 * 1024 * 1024}
      required={true}
    />
  );
}`}</code></pre>
        </section>
      </main>

      <footer className="app-footer">
        <p>FileInput Component - Production Ready</p>
      </footer>
    </div>
  )
}

export default App
