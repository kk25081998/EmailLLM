import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import Auth from './components/Auth';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorMessage from './components/ErrorMessage';
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
      
      // Provide more user-friendly error messages
      let errorMessage = 'Unable to verify authentication status. Please refresh the page.';
      
      if (error.response) {
        if (error.response.status === 401) {
          // Don't show error for 401 - just means not authenticated
          return;
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again in a few moments.';
        } else if (error.response.status >= 400) {
          errorMessage = 'Authentication service is temporarily unavailable. Please refresh the page.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection and refresh the page.';
      }
      
      setError(errorMessage);
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
      
      // Provide more user-friendly logout error messages
      let errorMessage = 'Failed to sign out properly. You may need to refresh the page.';
      
      if (error.response) {
        if (error.response.status >= 500) {
          errorMessage = 'Server error during sign out. Please refresh the page to ensure you are signed out.';
        } else if (error.response.status >= 400) {
          errorMessage = 'Sign out service is temporarily unavailable. Please refresh the page.';
        }
      } else if (error.request) {
        errorMessage = 'Network error during sign out. Please check your connection and refresh the page.';
      }
      
      setError(errorMessage);
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
        <header className="app-header">
          <div className="app-header-content">
            <div className="app-header-brand">
              <h1 className="app-title">Calendar Assistant</h1>
            </div>
          </div>
        </header>
        <ErrorBoundary>
          <Auth onLogin={checkAuthStatus} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-brand">
            <h1 className="app-title">Calendar Assistant</h1>
          </div>
          <div className="app-header-user">
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-greeting">Welcome back,</span>
                <span className="user-name">{user.name}</span>
              </div>
            </div>
            <button className="btn btn-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="error-container">
          <ErrorMessage 
            type="error"
            message={error}
            dismissible={true}
            onDismiss={() => setError(null)}
          />
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