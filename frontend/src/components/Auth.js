import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import GoogleSignInButton from './GoogleSignInButton';
import ErrorMessage from './ErrorMessage';

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
      
      // Provide more user-friendly error messages
      if (error === 'no_code') {
        errorMessage = 'Google authentication was cancelled or incomplete. Please try signing in again.';
      } else if (error === 'oauth_error') {
        errorMessage = message 
          ? `Google authentication error: ${message}. Please try again.`
          : 'There was an issue with Google authentication. Please try again.';
      } else if (error === 'auth_failed') {
        errorMessage = message 
          ? `Authentication failed: ${message}. Please contact support if this continues.`
          : 'Authentication failed. Please try again or contact support if the issue persists.';
      } else if (error === 'access_denied') {
        errorMessage = 'Access was denied. Please grant the necessary permissions to use Calendar Assistant.';
      } else if (error === 'server_error') {
        errorMessage = 'Server error occurred during authentication. Please try again in a few moments.';
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
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to initiate Google sign-in. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again in a few moments.';
        } else if (error.response.status === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (error.response.status >= 400 && error.response.status < 500) {
          errorMessage = 'Authentication service is currently unavailable. Please try again.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
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
          <ErrorMessage 
            type="error"
            message={error}
            dismissible={true}
            onDismiss={() => setError(null)}
            className="error-message--auth"
          />
        )}
        
        <GoogleSignInButton 
          onClick={handleGoogleLogin}
          loading={loading}
          disabled={false}
        />
        
        <div className="auth-permissions">
          <p>This app will access:</p>
          <ul>
            <li>Your Google Calendar events</li>
            <li>Basic profile information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth; 