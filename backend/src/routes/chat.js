const express = require('express');
const { requireAuth, requireTokens } = require('../middleware/auth');
const AIService = require('../services/aiService');
const GoogleCalendarService = require('../services/googleCalendar');

const router = express.Router();

// Initialize chat history in session if not exists
const initializeChatHistory = (req) => {
  if (!req.session.chatHistory) {
    req.session.chatHistory = [];
  }
};

// Send message to AI
router.post('/', requireAuth, requireTokens, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    initializeChatHistory(req);
    
    // Get calendar data for context
    let calendarData = null;
    try {
      const calendarService = new GoogleCalendarService(req.session.accessToken);
      const [events, stats, attendees] = await Promise.all([
        calendarService.getEvents(),
        calendarService.getMeetingStats(),
        calendarService.getAllAttendees()
      ]);
      calendarData = { events, stats, attendees };
    } catch (error) {
      console.warn('Failed to fetch calendar data for chat context:', error);
    }

    // Generate AI response
    const aiService = new AIService();
    const response = await aiService.generateResponse(message, calendarData);

    // Store in chat history
    const chatEntry = {
      id: Date.now(),
      userMessage: message,
      aiResponse: response,
      timestamp: new Date().toISOString()
    };

    req.session.chatHistory.push(chatEntry);

    res.json({
      response: response,
      timestamp: chatEntry.timestamp,
      id: chatEntry.id
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/history', requireAuth, (req, res) => {
  initializeChatHistory(req);
  res.json({ history: req.session.chatHistory || [] });
});

// Clear chat history
router.delete('/history', requireAuth, (req, res) => {
  req.session.chatHistory = [];
  res.json({ message: 'Chat history cleared' });
});



// Analyze meetings endpoint
router.post('/analyze-meetings', requireAuth, requireTokens, async (req, res) => {
  try {
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const [events, stats, attendees] = await Promise.all([
      calendarService.getEvents(),
      calendarService.getMeetingStats(),
      calendarService.getAllAttendees()
    ]);
    const calendarData = { events, stats, attendees };

    const aiService = new AIService();
    const analysis = await aiService.analyzeMeetings(calendarData);

    res.json({
      analysis: analysis,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Meeting analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze meetings' });
  }
});

// Analyze attendee patterns endpoint
router.post('/analyze-attendees', requireAuth, requireTokens, async (req, res) => {
  try {
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const [events, stats, attendees] = await Promise.all([
      calendarService.getEvents(),
      calendarService.getMeetingStats(),
      calendarService.getAllAttendees()
    ]);
    const calendarData = { events, stats, attendees };

    const aiService = new AIService();
    const analysis = await aiService.analyzeAttendeePatterns(calendarData);

    res.json({
      analysis: analysis,
      attendees: attendees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Attendee analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze attendees' });
  }
});

module.exports = router; 