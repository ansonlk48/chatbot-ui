import React, { useState } from 'react';
import styles from './App.module.css';
import Chat from './components/Chat';
import DocViewer from './components/DocViewer';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfContent, setPdfContent] = useState('');

  const handleFileUpload = (file, content) => {
    setSelectedFile(file);
    setPdfContent(content); // Store the extracted content
  };

  return (
    <div className={styles.centeredContainer}>
      <header className={styles.header}>
        Contract Chatbot
      </header>
        <div className={styles.container}>
          <div className={styles.chatSection}>
            <Chat selectedFile={selectedFile} pdfContent={pdfContent} />
          </div>
          <div className={styles.docSection}>
            <DocViewer onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}

export default App;
