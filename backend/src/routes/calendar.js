const express = require('express');
const { requireAuth, requireTokens } = require('../middleware/auth');
const GoogleCalendarService = require('../services/googleCalendar');

const router = express.Router();

// Get calendar events
router.get('/events', requireAuth, requireTokens, async (req, res) => {
  try {
    const { week } = req.query;
    console.log('[CALENDAR] /events - Week:', week);
    console.log('[CALENDAR] /events - Access token present:', !!req.session.accessToken);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    
    const events = await calendarService.getEvents(week);
    
    console.log('[CALENDAR] /events - Found', events.length, 'events');
    res.json({ events });
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get specific event by ID
router.get('/events/:eventId', requireAuth, requireTokens, async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('[CALENDAR] /events/:eventId - Event ID:', eventId);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const event = await calendarService.getEventById(eventId);
    
    console.log('[CALENDAR] /events/:eventId - Event found:', event.title);
    res.json({ event });
  } catch (error) {
    console.error('Calendar event error:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Get attendees for a specific event
router.get('/events/:eventId/attendees', requireAuth, requireTokens, async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log('[CALENDAR] /events/:eventId/attendees - Event ID:', eventId);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const attendeeData = await calendarService.getAttendeesForEvent(eventId);
    
    console.log('[CALENDAR] /events/:eventId/attendees - Found', attendeeData.attendees.length, 'attendees');
    res.json(attendeeData);
  } catch (error) {
    console.error('Calendar attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch event attendees' });
  }
});

// Get all attendees for the week
router.get('/attendees', requireAuth, requireTokens, async (req, res) => {
  try {
    const { week } = req.query;
    console.log('[CALENDAR] /attendees - Week:', week);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const attendees = await calendarService.getAllAttendees(week);
    
    console.log('[CALENDAR] /attendees - Found', attendees.length, 'unique attendees');
    res.json({ attendees });
  } catch (error) {
    console.error('Calendar attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

// Get attendees categorized by meeting type
router.get('/attendees/categorized', requireAuth, requireTokens, async (req, res) => {
  try {
    const { week } = req.query;
    console.log('[CALENDAR] /attendees/categorized - Week:', week);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    const categorizedAttendees = await calendarService.getAttendeesByMeetingType(week);
    
    console.log('[CALENDAR] /attendees/categorized - Internal:', categorizedAttendees.internal.length, 'External:', categorizedAttendees.external.length);
    res.json(categorizedAttendees);
  } catch (error) {
    console.error('Calendar categorized attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch categorized attendees' });
  }
});

// Get meeting statistics
router.get('/stats', requireAuth, requireTokens, async (req, res) => {
  try {
    const { week } = req.query;
    console.log('[CALENDAR] /stats - Week:', week);
    console.log('[CALENDAR] /stats - Access token present:', !!req.session.accessToken);
    
    const calendarService = new GoogleCalendarService(req.session.accessToken);
    
    const stats = await calendarService.getMeetingStats(week);
    
    console.log('[CALENDAR] /stats - Stats calculated:', stats);
    res.json({ stats });
  } catch (error) {
    console.error('Calendar stats error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar statistics' });
  }
});

module.exports = router; 