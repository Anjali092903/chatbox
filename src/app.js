import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Load previous messages
    socket.on('load messages', (data) => {
      setMessages(data);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (user && message) {
      socket.emit('chat message', { user, message });
      setMessage('');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter your username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
      </div>
      <div>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.user}:</strong> {msg.message}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
