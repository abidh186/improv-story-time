import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import './App.css';

interface Message {
  text: string;
  isUser: boolean;
}

const App: React.FC = () => {

  const [inputValue, setInputValue] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([    {text: "Let's create a story together! Where would you like the story to begin today? Start from anywhere and we'll take it from there.", isUser: false}]);

  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]); // Trigger useEffect every time messages change
  const handleGenerateText = async (input: string): Promise<string> => {
    setLoading(true);
    let responseText = '';

    try {
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });

      console.log({response})

      if (!response.ok) {
      
        const errorData = await response.json();
        responseText = errorData.error || 'Failed to fetch response';
      } else {
        const data = await response.json();
        responseText = data.response;
      }
    } catch (error) {
      console.error('Error:', error);
      responseText = 'Failed to fetch response';
    } finally {
      setLoading(false);
    }

    return responseText;
  };


  const handleInput = async () => {
    if (inputValue.trim() === '') return;

    const inputVal = inputValue;
    setInputValue('');

  
    const backendResponse = await handleGenerateText(inputVal);
    console.log({backendResponse})

  
    setMessages(prevMessages => [
      ...prevMessages,
      { text: inputVal, isUser: true },
      { text: backendResponse, isUser: false }
    ]);

  
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInput();
    }
  };

  return (
    <div className="App">
      <h1>Improv Story Time</h1>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        ref={inputRef}
      />
      <button onClick={handleInput} disabled={loading}>
        {loading ? 'Loading...' : 'Send'}
      </button>
    </div>
  );
};

export default App;