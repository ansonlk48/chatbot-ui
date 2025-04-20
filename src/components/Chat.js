import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../App.module.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Chat = ({ selectedFile, pdfContent }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (userInput.trim() !== "" && selectedFile) {
      const newMessages = [...messages, { sender: 'user', text: userInput }];
      setMessages(newMessages);
      setUserInput("");
      setLoading(true);

      try {
        const combinedQuestion = `Question: ${userInput} Document: ${pdfContent}`;
        const response = await axios.post("http://127.0.0.1:8000/get_answer", {
          question: combinedQuestion,
        });

        const botResponse = response.data.response;
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: botResponse },
        ]);
      } catch (error) {
        console.error("Error fetching response from API:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: "Sorry, There was an error processing your request." },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a question and upload a document.");
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.sender === 'user' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: msg.sender === 'user' ? '#007bff' : '#e5e5ea',
              color: msg.sender === 'user' ? '#fff' : '#000',
              padding: '10px 15px',
              borderRadius: '15px',
              margin: '5px 0',
              maxWidth: '70%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.sender === 'bot'
              ? <ReactMarkdown>{msg.text}</ReactMarkdown>
              : msg.text}
          </motion.div>
        ))}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              margin: '10px 0',
              alignSelf: 'flex-start',
              color: '#999',
              fontStyle: 'italic'
            }}
          >
            Thinking...
          </motion.div>
        )}
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.chatInput}
          placeholder="Type your question..."
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <button className={styles.sendBtn} onClick={handleSendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </>
  );
};

export default Chat;
