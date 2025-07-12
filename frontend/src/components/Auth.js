import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Auth = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for OAuth callback errors
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error === 'no_code') {
        errorMessage = 'No authorization code received from Google. Please try again.';
      } else if (error === 'oauth_error') {
        errorMessage = `OAuth error: ${message || 'Unknown error'}`;
      } else if (error === 'auth_failed') {
        errorMessage = `Authentication failed: ${message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      authAPI.login();
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to initiate login');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to Calendar Assistant</h2>
        <p>
          Connect your Google Calendar to get started. This app will help you manage your schedule 
          and provide AI-powered insights about your meetings and time management.
        </p>
        
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        
        <button 
          className="btn btn-primary" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
          <p>This app will access:</p>
          <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
            <li>Your Google Calendar events</li>
            <li>Basic profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth; 