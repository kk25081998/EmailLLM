const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleCalendarService {
  constructor(accessToken) {
    this.calendar = google.calendar({ version: 'v3' });
    this.oauth2Client = new OAuth2Client();
    this.oauth2Client.setCredentials({ access_token: accessToken });
  }

  async getEvents(weekStart = null) {
    try {
      console.log('[CALENDAR] Getting events for week:', weekStart);
      console.log('[CALENDAR] Access token present:', !!this.oauth2Client.credentials.access_token);
      
      let timeMin, timeMax;
      
      if (weekStart) {
        const startDate = new Date(weekStart);
        timeMin = startDate.toISOString();
        timeMax = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        // Default to current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        timeMin = startOfWeek.toISOString();
        timeMax = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      console.log('[CALENDAR] Time range:', { timeMin, timeMax });

      const response = await this.calendar.events.list({
        auth: this.oauth2Client,
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
        fields: 'items(id,summary,start,end,description,location,attendees,organizer,guestsCanSeeOtherGuests,guestsCanModify,guestsCanInviteOthers)'
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary || 'No Title',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        description: event.description || '',
        location: event.location || '',
        attendees: this.processAttendees(event.attendees || []),
        organizer: event.organizer || null,
        guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests || false,
        guestsCanModify: event.guestsCanModify || false,
        guestsCanInviteOthers: event.guestsCanInviteOthers || false
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  processAttendees(attendees) {
    return attendees.map(attendee => ({
      email: attendee.email,
      displayName: attendee.displayName || attendee.email.split('@')[0],
      responseStatus: attendee.responseStatus || 'needsAction',
      self: attendee.self || false,
      organizer: attendee.organizer || false,
      optional: attendee.optional || false
    }));
  }

  async getEventById(eventId) {
    try {
      console.log('[CALENDAR] Getting event by ID:', eventId);
      
      const response = await this.calendar.events.get({
        auth: this.oauth2Client,
        calendarId: 'primary',
        eventId: eventId,
        fields: 'id,summary,start,end,description,location,attendees,organizer,guestsCanSeeOtherGuests,guestsCanModify,guestsCanInviteOthers'
      });

      const event = response.data;
      return {
        id: event.id,
        title: event.summary || 'No Title',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime,
        description: event.description || '',
        location: event.location || '',
        attendees: this.processAttendees(event.attendees || []),
        organizer: event.organizer || null,
        guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests || false,
        guestsCanModify: event.guestsCanModify || false,
        guestsCanInviteOthers: event.guestsCanInviteOthers || false
      };
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw new Error('Failed to fetch event details');
    }
  }

  async getAttendeesForEvent(eventId) {
    try {
      const event = await this.getEventById(eventId);
      return {
        eventTitle: event.title,
        attendees: event.attendees,
        organizer: event.organizer,
        canSeeAttendees: event.guestsCanSeeOtherGuests
      };
    } catch (error) {
      console.error('Error fetching attendees for event:', error);
      throw new Error('Failed to fetch event attendees');
    }
  }

  async getAllAttendees(weekStart = null) {
    try {
      const events = await this.getEvents(weekStart);
      const attendeeMap = new Map();
      
      events.forEach(event => {
        event.attendees.forEach(attendee => {
          if (!attendee.self) { // Exclude the current user
            const key = attendee.email.toLowerCase();
            if (!attendeeMap.has(key)) {
              attendeeMap.set(key, {
                email: attendee.email,
                displayName: attendee.displayName,
                meetings: []
              });
            }
            attendeeMap.get(key).meetings.push({
              eventId: event.id,
              title: event.title,
              start: event.start,
              end: event.end
            });
          }
        });
      });

      return Array.from(attendeeMap.values()).sort((a, b) => 
        a.displayName.localeCompare(b.displayName)
      );
    } catch (error) {
      console.error('Error fetching all attendees:', error);
      throw new Error('Failed to fetch attendees');
    }
  }

  async getAttendeesByMeetingType(weekStart = null) {
    try {
      const events = await this.getEvents(weekStart);
      const attendeesByType = {
        internal: [],
        external: [],
        recurring: []
      };

      events.forEach(event => {
        event.attendees.forEach(attendee => {
          if (!attendee.self) {
            const attendeeInfo = {
              email: attendee.email,
              displayName: attendee.displayName,
              eventTitle: event.title,
              eventId: event.id,
              start: event.start,
              end: event.end
            };

            // Categorize attendees
            if (attendee.email.includes('@gmail.com') || attendee.email.includes('@google.com')) {
              attendeesByType.internal.push(attendeeInfo);
            } else {
              attendeesByType.external.push(attendeeInfo);
            }
          }
        });
      });

      return attendeesByType;
    } catch (error) {
      console.error('Error categorizing attendees:', error);
      throw new Error('Failed to categorize attendees');
    }
  }

  async getMeetingStats(weekStart = null) {
    try {
      const events = await this.getEvents(weekStart);
      
      const meetingStats = {
        totalMeetings: 0,
        totalHours: 0,
        averageMeetingLength: 0,
        meetingsByDay: {},
        longestMeeting: null,
        shortestMeeting: null,
        totalAttendees: 0,
        uniqueAttendees: 0,
        averageAttendeesPerMeeting: 0
      };

      const uniqueAttendeeEmails = new Set();

      events.forEach(event => {
        if (!event.allDay) {
          const start = new Date(event.start);
          const end = new Date(event.end);
          const duration = (end - start) / (1000 * 60 * 60); // hours

          meetingStats.totalMeetings++;
          meetingStats.totalHours += duration;

          // Count attendees
          const attendeeCount = event.attendees.filter(a => !a.self).length;
          meetingStats.totalAttendees += attendeeCount;
          
          event.attendees.forEach(attendee => {
            if (!attendee.self) {
              uniqueAttendeeEmails.add(attendee.email.toLowerCase());
            }
          });

          const day = start.toLocaleDateString();
          meetingStats.meetingsByDay[day] = (meetingStats.meetingsByDay[day] || 0) + 1;

          if (!meetingStats.longestMeeting || duration > meetingStats.longestMeeting.duration) {
            meetingStats.longestMeeting = { 
              title: event.title, 
              duration,
              attendees: event.attendees.filter(a => !a.self).length
            };
          }

          if (!meetingStats.shortestMeeting || duration < meetingStats.shortestMeeting.duration) {
            meetingStats.shortestMeeting = { 
              title: event.title, 
              duration,
              attendees: event.attendees.filter(a => !a.self).length
            };
          }
        }
      });

      if (meetingStats.totalMeetings > 0) {
        meetingStats.averageMeetingLength = meetingStats.totalHours / meetingStats.totalMeetings;
        meetingStats.averageAttendeesPerMeeting = meetingStats.totalAttendees / meetingStats.totalMeetings;
      }

      meetingStats.uniqueAttendees = uniqueAttendeeEmails.size;

      return meetingStats;
    } catch (error) {
      console.error('Error calculating meeting stats:', error);
      throw new Error('Failed to calculate meeting statistics');
    }
  }
}

module.exports = GoogleCalendarService; 