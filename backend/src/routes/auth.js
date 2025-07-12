const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`
);

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
  console.log('[AUTH] /google - Session before redirect:', req.session);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent'
  });
  
  res.redirect(authUrl);
});

// Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    console.log('[AUTH] /google/callback - Query:', req.query);
    console.log('[AUTH] /google/callback - Session before token:', req.session);
    
    if (error) {
      console.error('[AUTH] OAuth error from Google:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=oauth_error&message=${error}`);
    }
    
    if (!code) {
      console.error('[AUTH] No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_code`);
    }

    console.log('[AUTH] Getting tokens with code:', code);
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[AUTH] Tokens received:', { 
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing'
    });
    
    // Get user info
    oauth2Client.setCredentials(tokens);
    const { google } = require('googleapis');
    const oauth2 = google.oauth2('v2');
    
    console.log('[AUTH] Fetching user info...');
    let userInfo;
    try {
      userInfo = await oauth2.userinfo.get({ auth: oauth2Client });
      console.log('[AUTH] User info received:', userInfo.data);
    } catch (userInfoError) {
      console.error('[AUTH] Error fetching user info:', userInfoError);
      throw new Error(`Failed to fetch user info: ${userInfoError.message}`);
    }

    // Store tokens and user info in session
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.user = {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    };
    console.log('[AUTH] /google/callback - Session after login:', req.session);

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=auth_failed&message=${error.message}`);
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  console.log('[AUTH] /status - Session:', req.session);
  if (req.session.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        email: req.session.user.email,
        name: req.session.user.name,
        picture: req.session.user.picture
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Debug endpoint to check OAuth configuration
router.get('/debug', (req, res) => {
  res.json({
    oauth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    client_id_present: !!process.env.GOOGLE_CLIENT_ID,
    client_secret_present: !!process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`,
    session_secret_present: !!process.env.SESSION_SECRET,
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
    backend_url: process.env.BACKEND_URL || 'http://localhost:3001'
  });
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
  console.log('[AUTH] /logout - Session before destroy:', req.session);
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router; 