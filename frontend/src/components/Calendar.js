import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { Users, Mail } from 'lucide-react';
import { calendarAPI, chatAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPurpose, setEmailPurpose] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const [eventsResponse, statsResponse] = await Promise.all([
        calendarAPI.getEvents(weekStart),
        calendarAPI.getStats(weekStart)
      ]);
      
      setEvents(eventsResponse.data.events);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);

  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const response = await calendarAPI.getEvents(weekStart);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  }, [currentWeek]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const response = await calendarAPI.getStats(weekStart);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [currentWeek]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => addDays(prev, direction * 7));
    // Fetch new data for the new week
    fetchEvents();
    fetchStats();
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowAttendeeModal(true);
  };

  const handleDraftEmailToAttendees = async () => {
    if (!selectedEvent || !emailPurpose.trim()) return;

    try {
      setEmailLoading(true);
      
      // Create a message that includes the event context and purpose
      const attendees = selectedEvent.attendees.filter(a => !a.self);
      const attendeeList = attendees.map(a => `${a.displayName} (${a.email})`).join(', ');
      
      const message = `Can you draft a professional email to the attendees of "${selectedEvent.title}" for ${emailPurpose}? The attendees are: ${attendeeList}. Please include a subject line and make it concise and professional.`;
      
      const response = await chatAPI.sendMessage(message);
      setEmailDraft(response.data.response);
    } catch (error) {
      console.error('Failed to draft email:', error);
      setError('Failed to draft email to attendees');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="calendar-loading-container">
        <LoadingSpinner size="large" text="Loading calendar..." />
      </div>
    );
  }

  return (
    <div className="calendar-outer-container">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <h2>Calendar</h2>
          <div className="calendar-nav-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => navigateWeek(-1)}
              disabled={eventsLoading || statsLoading}
            >
              ← Previous
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentWeek(new Date())}
              disabled={eventsLoading || statsLoading}
            >
              Today
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigateWeek(1)}
              disabled={eventsLoading || statsLoading}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="calendar-stats-summary">
          {statsLoading ? (
            <LoadingSpinner size="small" text="Loading statistics..." />
          ) : stats ? (
            <div className="calendar-stats-grid">
              <div>
                <strong>{stats.totalMeetings}</strong> meetings this week
              </div>
              <div>
                <strong>{stats.totalHours.toFixed(1)}</strong> hours in meetings
              </div>
              <div>
                <strong>{stats.averageMeetingLength.toFixed(1)}</strong> avg hours per meeting
              </div>
              <div>
                <strong>{stats.uniqueAttendees}</strong> unique attendees
              </div>
              <div>
                <strong>{stats.averageAttendeesPerMeeting.toFixed(1)}</strong> avg attendees per meeting
              </div>
            </div>
          ) : (
            <div className="calendar-no-stats-message">
              No statistics available
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error">
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="calendar-grid-container">
          {eventsLoading ? (
            <div className="calendar-loading-events-container">
              <LoadingSpinner size="medium" text="Loading events..." />
            </div>
          ) : (
            <div className="calendar-week-grid">
              {getWeekDays().map((day, index) => (
                <div 
                  key={index}
                  className={`calendar-day-column ${isToday(day) ? 'calendar-today-column' : ''}`}
                  aria-label={`${format(day, 'EEE, MMMM d')}`}
                >
                  {/* Day Header */}
                  <div className="calendar-day-header">
                    <div className="calendar-day-header-text">
                      {format(day, 'EEE')}
                    </div>
                    <div className="calendar-day-header-date">
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="calendar-events-list">
                    {getEventsForDay(day).map((event, eventIndex) => (
                      <div 
                        key={event.id}
                        className="calendar-event-card"
                        title={`${event.title} - ${formatTime(event.start)} - ${event.attendees.filter(a => !a.self).length} attendees`}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="calendar-event-time">
                          {formatTime(event.start)}
                        </div>
                        <div className="calendar-event-title">
                          {event.title}
                        </div>
                        {event.attendees.filter(a => !a.self).length > 0 && (
                          <div className="calendar-event-attendees-count">
                            <Users size={10} />
                            {event.attendees.filter(a => !a.self).length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendee Modal */}
        {showAttendeeModal && selectedEvent && (
          <div className="calendar-attendee-modal-overlay">
            <div className="calendar-attendee-modal-content">
              <h3 className="calendar-attendee-modal-title">
                <Users size={20} />
                Meeting Details
              </h3>
              
              <div className="calendar-meeting-details">
                <h4>{selectedEvent.title}</h4>
                <p>{format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')} at {formatTime(selectedEvent.start)}</p>
              </div>

              <div className="calendar-attendees-list">
                <h5>Attendees ({selectedEvent.attendees.filter(a => !a.self).length})</h5>
                {selectedEvent.attendees.filter(a => !a.self).length > 0 ? (
                  <div className="calendar-attendees-list-content">
                    {selectedEvent.attendees.filter(a => !a.self).map((attendee, index) => (
                      <div key={index} className="calendar-attendee-item">
                        <div>
                          <div className="calendar-attendee-name">{attendee.displayName}</div>
                          <div className="calendar-attendee-email">{attendee.email}</div>
                        </div>
                        <div className="calendar-attendee-response-status">
                          {attendee.responseStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="calendar-no-attendees-message">No attendees found</p>
                )}
              </div>

              <div className="calendar-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAttendeeModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Close
                </button>
                {selectedEvent.attendees.filter(a => !a.self).length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowAttendeeModal(false);
                      setShowEmailModal(true);
                    }}
                  >
                    <Mail size={16} />
                    Draft Email to Attendees
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email Drafting Modal */}
        {showEmailModal && selectedEvent && (
          <div className="calendar-email-modal-overlay">
            <div className="calendar-email-modal-content">
              <h3 className="calendar-email-modal-title">
                <Mail size={20} />
                Draft Email to Attendees
              </h3>
              
              {!emailDraft ? (
                <div className="calendar-email-draft-form">
                  <div className="calendar-email-draft-form-item">
                    <label>
                      Email Purpose:
                    </label>
                    <textarea
                      value={emailPurpose}
                      onChange={(e) => setEmailPurpose(e.target.value)}
                      placeholder="Brief description of the email purpose..."
                      className="calendar-email-draft-textarea"
                      required
                    />
                  </div>
                  
                  <div className="calendar-email-draft-form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEmailModal(false);
                        setEmailPurpose('');
                        setEmailDraft('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={emailLoading || !emailPurpose.trim()}
                      onClick={handleDraftEmailToAttendees}
                    >
                      {emailLoading ? 'Drafting...' : 'Draft Email'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="calendar-email-draft-preview">
                  <div className="calendar-email-draft-preview-content">
                    {emailDraft}
                  </div>
                  <div className="calendar-email-draft-preview-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEmailModal(false);
                        setEmailPurpose('');
                        setEmailDraft('');
                      }}
                    >
                      Close
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(emailDraft);
                        alert('Email copied to clipboard!');
                      }}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar; 