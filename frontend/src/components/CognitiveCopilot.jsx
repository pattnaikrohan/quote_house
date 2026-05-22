import React, { useState } from 'react';
import './CognitiveCopilot.css';

export default function CognitiveCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Cognitive Copilot. Ask me anything about your pipeline or specific quotes.' }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setQuery('');

    // Mock AI response delay
    setTimeout(() => {
      setMessages([...newMessages, { 
        sender: 'ai', 
        text: 'This is a static response. AI processing is currently mocked for this demonstration. I can simulate finding a quote if you like!' 
      }]);
    }, 1000);
  };

  return (
    <div className={`copilot-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="copilot-trigger" onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="copilot-badge">✨</span>
        </button>
      )}

      {isOpen && (
        <div className="copilot-window">
          <div className="copilot-header">
            <div className="copilot-title">
              <span className="sparkle">✨</span>
              <h4>Cognitive Copilot</h4>
            </div>
            <button className="btn-close" onClick={() => setIsOpen(false)} style={{ color: '#fff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="copilot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          
          <form className="copilot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about your quotes..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={!query.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
