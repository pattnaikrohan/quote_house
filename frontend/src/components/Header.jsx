import React from 'react';
import './Header.css';

export default function Header({ onUploadClick, currentUser, onUserChange }) {
  const users = [
    { name: 'Sarah Williams', role: 'Sales Representative', avatar: 'SW' },
    { name: 'James Nguyen', role: 'Branch Manager (Sydney)', avatar: 'JN' },
    { name: 'Steve Miller', role: 'Operations Lead / CIO', avatar: 'SM' }
  ];

  return (
    <header className="header">
      <div className="header-left">
        <a href="/" className="logo-link">
          <div className="logo-icon">
            <img src="/aaw.png" alt="AAW Logo" className="logo-image" />
          </div>
          <div className="logo-wordmark">
            <span className="hw-app">Quote House</span>
          </div>
        </a>
      </div>
      
      <div className="header-right">
        <button className="btn-upload" onClick={onUploadClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload quote
        </button>

        <div className="profile-selector">
          <div className="avatar">{currentUser.avatar}</div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
          <select 
            className="user-select" 
            value={currentUser.name}
            onChange={(e) => {
              const selected = users.find(u => u.name === e.target.value);
              if (selected) onUserChange(selected);
            }}
          >
            {users.map(u => (
              <option key={u.name} value={u.name}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
