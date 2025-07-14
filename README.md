# Calendar Assistant

A web-based calendar assistant that allows users to authenticate with Google Calendar, view their calendar data, and interact with an AI agent to manage their schedule.

## ✨ Features

### 🔐 Authentication

- **Google OAuth 2.0** integration with secure token management
- **Session persistence** across browser sessions
- **Automatic logout** with token cleanup
- **Error handling** for authentication failures

### 📅 Calendar Management

- **Weekly calendar view** with navigation controls
- **Real-time event display** with time, title, and duration
- **Meeting statistics** including total meetings, hours, and averages
- **All-day event support** with proper handling
- **Responsive design** for mobile and desktop
- **Attendee information** display and management
- **Click-to-view** meeting details with attendee lists

### 🤖 AI Assistant

- **OpenAI GPT-4 integration** for intelligent responses
- **Context-aware chat** using calendar data and attendee information
- **Quick action buttons** for common queries
- **Chat history persistence** during sessions
- **Natural email drafting** integrated into chat conversation
- **Meeting analysis** with detailed insights
- **Attendee pattern analysis** and relationship insights
- **Smart email recipient suggestions** based on meeting attendees

### 🎨 User Interface

- **Modern, responsive design** with gradient backgrounds
- **Split-pane layout** (calendar + chat)
- **Loading states** with animated spinners
- **Error boundaries** for graceful error handling
- **Modal dialogs** for meeting analysis
- **Mobile-responsive** design
- **Interactive calendar events** with attendee counts
- **Attendee detail modals** with email drafting capabilities

### 🔧 Technical Features

- **Docker containerization** for easy deployment
- **Environment validation** at startup
- **Rate limiting** and security headers
- **CORS configuration** for cross-origin requests
- **Health check endpoints** for monitoring
- **Comprehensive error handling** and logging
- **Attendee data extraction** from Google Calendar API
- **Advanced meeting analytics** with attendee insights

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** - Make sure you have Docker and Docker Compose installed
- **Google Cloud Console Account** - For OAuth credentials
- **OpenAI API Key** - For AI functionality

### 1. Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd EmailLLM

# Copy environment template and add your own keys
cp env.example .env

# Or manually edit .env file with your credentials
```

### 2. Configure API Keys

#### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3001/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`
6. If your app, is not published where the keys are generated, add your email in test user so you can actually test the app with that user

#### OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add the key to your `.env` file

### 3. Run the Application

#### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Environment Variables

```env
# Required
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=generate_a_random_32_character_string
```

## 🛠️ API Endpoints

### Authentication

- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout user
- `GET /auth/debug` - Debug OAuth configuration

### Calendar

- `GET /api/calendar/events?week=YYYY-MM-DD` - Get calendar events
- `GET /api/calendar/events/:eventId` - Get specific event details
- `GET /api/calendar/events/:eventId/attendees` - Get attendees for specific event
- `GET /api/calendar/attendees?week=YYYY-MM-DD` - Get all attendees for the week
- `GET /api/calendar/attendees/categorized?week=YYYY-MM-DD` - Get attendees by meeting type
- `GET /api/calendar/stats?week=YYYY-MM-DD` - Get meeting statistics

### Chat & AI

- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

- `POST /api/chat/analyze-meetings` - Analyze meetings with attendee insights
- `POST /api/chat/analyze-attendees` - Analyze attendee patterns

### System

- `GET /health` - Health check with service status

## 🎯 Use Cases

### Meeting Analysis

- "How much time am I spending in meetings?"
- "Analyze my meeting patterns and provide insights"
- "What's my average meeting duration?"
- "Show me my most frequent meeting attendees"

### Schedule Optimization

- "How can I optimize my schedule?"
- "Suggest time blocking strategies"
- "Help me reduce meeting time"
- "Analyze my attendee patterns"

### Email Drafting

- "Can you draft an email to schedule a meeting with john@example.com?"
- "Help me write a follow-up email to my recent meeting attendees"
- "Draft a professional email for project discussion"
- "Write an email to invite someone to a meeting about budget planning"
- "Suggest who I should email based on my recent meetings"

### Attendee Management

- "Show me all attendees from this week's meetings"
- "Who are my most frequent collaborators?"
- "Suggest follow-up actions for recent meeting attendees"
- "Analyze my communication patterns with attendees"

### General Assistance

- "What meetings do I have today?"
- "Show me my schedule for this week"
- "Help me organize my calendar"
- "Who should I follow up with from recent meetings?"

## 🔧 Development

### Project Structure

```
EmailLLM/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── app.js         # Main application file
│   ├── Dockerfile         # Production Docker image
│   └── Dockerfile.dev     # Development Docker image
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── App.js        # Main React component
│   ├── Dockerfile         # Production Docker image
│   └── Dockerfile.dev     # Development Docker image
├── docker-compose.yml     # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
└── README.md             # This file
```

### Available Scripts

```bash
npm run setup      # Interactive environment setup
npm run dev        # Start development mode
npm start          # Start production mode
npm run stop       # Stop all containers
npm run logs       # View container logs
```

## 🐛 Troubleshooting

### Common Issues

#### OAuth Errors

- **"redirect_uri_mismatch"**: Ensure redirect URI in Google Cloud Console exactly matches `http://localhost:3001/auth/google/callback`
- **"access_denied"**: Check that user granted calendar permissions

#### API Errors

- **"Failed to fetch calendar data"**: Verify Google Calendar API is enabled and credentials are correct
- **"Failed to generate AI response"**: Check OpenAI API key and credits
- **"No attendees found"**: Check if meetings have attendees and user has permission to see them

#### Docker Issues

- **Port conflicts**: Ensure ports 3000 and 3001 are available
- **Build failures**: Try `docker-compose down && docker-compose up --build`
- **Permission errors**: Run with appropriate Docker permissions

#### Environment Issues

- **Missing variables**: Check `.env` file and required variables
- **Invalid credentials**: Verify API keys are correct and active

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Check environment variables
docker-compose exec backend env | grep -E "(GOOGLE|OPENAI|SESSION)"

# Health check
curl http://localhost:3001/health

# Rebuild containers
docker-compose down
docker-compose up --build
```

## 🔒 Security Considerations

- **Environment variables**: Never commit `.env` file to version control
- **Session secrets**: Use strong, random 32+ character strings
- **API keys**: Keep secure and rotate periodically
- **HTTPS**: Use in production with proper SSL certificates
- **CORS**: Properly configured for frontend-backend communication
- **Attendee data**: Respect privacy settings and permissions

## 🚀 Production Deployment

For production deployment, consider:

1. **HTTPS**: Use reverse proxy (nginx) with SSL certificates
2. **Database**: Implement persistent session storage
3. **Monitoring**: Add logging and monitoring solutions
4. **Scaling**: Use container orchestration (Kubernetes, Docker Swarm)
5. **Backup**: Implement regular data backups
6. **Security**: Add rate limiting and security headers
7. **Privacy**: Ensure attendee data handling complies with regulations

## 📄 License

This project is for educational and personal use. Please respect the terms of service for Google Calendar API and OpenAI API.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are installed and configured
5. Check the health endpoint for service status

---

**Happy scheduling! 🎉**
