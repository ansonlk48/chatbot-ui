// Chat.js
import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion } from 'framer-motion';
import styles from '../App.module.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Chat = ({ selectedFile, pdfContent }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState([]); // State for suggestions

  // API Endpoint URL (replace with your actual API Gateway URL)
  const API_ENDPOINT = "http://localhost:8000/get_answer"; // <-- IMPORTANT: Update this

  const sendMessage = async (queryToSend) => {
    if (queryToSend.trim() === "" || !selectedFile) {
      alert("Please enter a question and ensure a document is uploaded.");
      return; // Exit if no query or file
    }

    // Add user message optimistically
    const newUserMessage = { sender: 'user', text: queryToSend };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setUserInput(""); // Clear input field
    setSuggestedQueries([]); // Clear previous suggestions
    setLoading(true);

    try {
      // --- MODIFIED: Send question and contract separately ---
      const response = await axios.post(API_ENDPOINT, {
        question: queryToSend,
        contract: pdfContent, // Send the full PDF content as 'contract'
      });

      // --- MODIFIED: Extract response and suggestions ---
      const { response: botResponse, suggested_queries: suggestions = [] } = response.data;

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: botResponse },
      ]);
      setSuggestedQueries(suggestions.slice(0, 3)); // Store up to 3 suggestions

    } catch (error) {
      console.error("Error fetching response from API:", error);
      // Display more specific error if available from backend
      const errorMessage = error.response?.data?.error || "Sorry, there was an error processing your request.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Error: ${errorMessage}` },
      ]);
      setSuggestedQueries([]); // Clear suggestions on error
    } finally {
      setLoading(false);
    }
  };


  // --- MODIFIED: Renamed original handler, now calls sendMessage ---
  const handleSendManualMessage = () => {
    sendMessage(userInput); // Send the text currently in the input box
  };

  // --- NEW: Handler for clicking a suggestion button ---
  const handleSuggestionClick = (query) => {
    // Optionally set the input field first, though sendMessage clears it anyway
    // setUserInput(query);
    sendMessage(query); // Send the suggested query directly
  };


  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    // Allow sending with Enter key only if not loading
    if (e.key === 'Enter' && !loading) {
      handleSendManualMessage();
    }
  };

  // Optional: Add a welcome message or initial state
  useEffect(() => {
    setMessages([{ sender: 'bot', text: 'Hello! Please upload a contract document and ask a question.' }]);
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <>
      <div className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            // Animation and styling mostly unchanged
            initial={{ opacity: 0, y: 10, x: msg.sender === 'user' ? 50 : -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
          >
            {/* Use ReactMarkdown for bot messages */}
            {msg.sender === 'bot'
              ? <ReactMarkdown children={msg.text} /> // Use children prop
              : msg.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.loadingIndicator} // Use CSS Modules class
          >
            Thinking...
          </motion.div>
        )}
      </div>

      {/* --- NEW: Suggestions Area --- */}
      {suggestedQueries.length > 0 && !loading && ( // Show only if suggestions exist and not loading
          <div className={styles.suggestionsArea}>
              {suggestedQueries.map((query, index) => (
                  <button
                      key={index}
                      className={styles.suggestionButton}
                      onClick={() => handleSuggestionClick(query)}
                      disabled={loading} // Disable while loading
                  >
                      {query}
                  </button>
              ))}
          </div>
      )}


      <div className={styles.inputArea}>
        <input
          className={styles.chatInput}
          placeholder={selectedFile ? "Type your question..." : "Please upload a document first"}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={loading || !selectedFile} // Disable if loading or no file selected
        />
        <button
          className={styles.sendBtn}
          onClick={handleSendManualMessage} // Use the renamed handler
          disabled={loading || userInput.trim() === "" || !selectedFile} // Disable if loading, input empty, or no file
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </>
  );
};

export default Chat;