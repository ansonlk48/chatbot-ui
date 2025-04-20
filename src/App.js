import React, { useState } from 'react';
import styles from './App.module.css'; // Make sure this CSS file exists and is appropriate
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
    // It's often good practice for the outermost container to manage overall page layout
    <div className={styles.appWrapper}> {/* Added a wrapper if needed for full page height */}
      <div className={styles.centeredContainer}>
        <header className={styles.header}>
          Contract Chatbot
        </header>
        <div className={styles.container}> {/* This holds the main two sections */}
          <div className={styles.chatSection}>
            <Chat selectedFile={selectedFile} pdfContent={pdfContent} />
          </div>
          <div className={styles.docSection}>
            <DocViewer onFileUpload={handleFileUpload} />
          </div>
        </div> {/* End of .container */}

        {/* --- NEW FOOTER SECTION --- */}
        {/* Placed after the main content container but inside the centered area */}
        <footer className={styles.appFooter}>
          <p>
            <strong>Disclaimer:</strong> The information provided by this tool is for informational purposes only and does not constitute legal advice. The AI analysis may contain errors or omissions and should not be relied upon as a substitute for consultation with a qualified legal professional. Use of this tool does not create an attorney-client relationship. Always consult with a licensed attorney for advice specific to your situation.
          </p>
        </footer>
        {/* --- END FOOTER SECTION --- */}

      </div> {/* End of .centeredContainer */}
    </div> // End of .appWrapper
  );
}

export default App;