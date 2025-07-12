import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Check authentication status
  getStatus: () => api.get('/auth/status'),
  
  // Initiate Google OAuth
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

// Calendar API
export const calendarAPI = {
  // Get calendar events
  getEvents: (week = null) => {
    const params = week ? { week } : {};
    return api.get('/api/calendar/events', { params });
  },
  
  // Get specific event by ID
  getEvent: (eventId) => api.get(`/api/calendar/events/${eventId}`),
  
  // Get attendees for a specific event
  getEventAttendees: (eventId) => api.get(`/api/calendar/events/${eventId}/attendees`),
  
  // Get all attendees for the week
  getAttendees: (week = null) => {
    const params = week ? { week } : {};
    return api.get('/api/calendar/attendees', { params });
  },
  
  // Get attendees categorized by meeting type
  getCategorizedAttendees: (week = null) => {
    const params = week ? { week } : {};
    return api.get('/api/calendar/attendees/categorized', { params });
  },
  
  // Get meeting statistics
  getStats: (week = null) => {
    const params = week ? { week } : {};
    return api.get('/api/calendar/stats', { params });
  },
};

// Chat API
export const chatAPI = {
  // Send message to AI
  sendMessage: (message) => api.post('/api/chat', { message }),
  
  // Get chat history
  getHistory: () => api.get('/api/chat/history'),
  
  // Clear chat history
  clearHistory: () => api.delete('/api/chat/history'),
  

  
  // Analyze meetings
  analyzeMeetings: () => api.post('/api/chat/analyze-meetings'),
  
  // Analyze attendee patterns
  analyzeAttendees: () => api.post('/api/chat/analyze-attendees'),
};

export default api; 