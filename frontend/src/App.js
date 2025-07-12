import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import Auth from './components/Auth';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getStatus();
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <div className="header">
          <h1>Calendar Assistant</h1>
        </div>
        <ErrorBoundary>
          <Auth onLogin={checkAuthStatus} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Calendar Assistant</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error" style={{ maxWidth: '1400px', margin: '1rem auto' }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="main-content">
        <div className="calendar-section">
          <ErrorBoundary>
            <Calendar />
          </ErrorBoundary>
        </div>
        <div className="chat-section">
          <ErrorBoundary>
            <Chat />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App; 