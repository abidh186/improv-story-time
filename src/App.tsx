import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ProgressCircle } from './progress-cicle';
import './App.css';

interface Message {
    text: string;
    isUser: boolean;
}

const App: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([
        {
            text: 'Let’s create a story together! You can start it wherever you like and make up anything that comes to mind. I’ll add to it, and then you can continue from there. Let’s see where our imagination takes us. Ready to begin?',
            isUser: false,
        },
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const MIN_CHAR_LIMIT = 60;

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleGenerateText = async (input: string): Promise<string> => {
        setLoading(true);
        let responseText = '';
        try {
            const response = await fetch(`${apiUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input }),
            });

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
        if (inputValue.trim() === '' || inputValue.length < MIN_CHAR_LIMIT)
            return;

        const inputVal = inputValue;
        setInputValue('');

        const backendResponse = await handleGenerateText(inputVal);

        setMessages((prevMessages) => [
            ...prevMessages,
            { text: inputVal, isUser: true },
            { text: backendResponse, isUser: false },
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

    const getProgress = () => {
        return Math.min((inputValue.length / MIN_CHAR_LIMIT) * 100, 100);
    };

    const getCircleColor = () => {
        const progress = getProgress();
        if (progress === 100) return '#4CAF50';
        if (progress >= 90) return '#9CCC65';
        if (progress >= 60) return '#FFC107';
        return '#FF5722';
    };

    const getRemainingChars = () => {
        return Math.max(MIN_CHAR_LIMIT - inputValue.length, 0);
    };

    return (
        <div className="App">
            <h1>Story Time</h1>
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${
                            message.isUser ? 'user-message' : 'bot-message'
                        }`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    ref={inputRef}
                />
                <ProgressCircle
                    progress={getProgress()}
                    color={getCircleColor()}
                    charCount={getRemainingChars()}
                />
            </div>
            <button
                onClick={handleInput}
                disabled={loading || inputValue.length < MIN_CHAR_LIMIT}
            >
                {loading ? 'Loading...' : 'Send'}
            </button>
        </div>
    );
};

export default App;
