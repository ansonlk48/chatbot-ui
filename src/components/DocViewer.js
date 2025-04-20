import React, { useRef, useState } from "react";
import styles from '../App.module.css';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import 'pdfjs-dist/build/pdf.worker.mjs';

const DocViewer = ({ onFileUpload }) => {
  const [content, setContent] = useState('Upload a text or PDF file to view here.');
  const [isPdf, setIsPdf] = useState(false);
  const canvasContainerRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setIsPdf(true);
      setContent('Loading PDF...');
      handlePDF(file);
    } else {
      setIsPdf(false);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setContent(evt.target.result);
        onFileUpload(file, evt.target.result); // Pass text content to parent
      };
      reader.readAsText(file);
    }
  };

  const handlePDF = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        // --- EXTRACT TEXT ---
        let pdfText = '';
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          pdfText += pageText + '\n';
        }
        // Pass to parent (Chat needs the text)
        onFileUpload(file, pdfText);

        // --- RENDER PDF ---
        // Clear previous previews:
        if (canvasContainerRef.current) canvasContainerRef.current.innerHTML = "";
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.2 });

          const canvas = document.createElement('canvas');
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 16px";
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvasContainerRef.current.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }
        setContent(""); // Don't show text version

      } catch (err) {
        setContent('Error loading PDF: ' + err.message);
      }
    };
    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <label className={styles.uploadBtn}>
        📁 Upload Document
        <input
          type="file"
          accept=".txt,.md,.js,.py,.html,.css,.pdf,application/pdf"
          onChange={handleFile}
          hidden
        />
      </label>
      {isPdf ? (
        <div
          ref={canvasContainerRef}
          className={styles.docContainer}
          style={{ minHeight: "256px" }}
        ></div>
      ) : (
        <motion.pre
          key={content}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxHeight: '85vh', overflowY: 'auto' }}
        >
          {content}
        </motion.pre>
      )}
    </div>
  );
};

export default DocViewer;
