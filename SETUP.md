# Calendar Assistant - Setup Guide

This guide will help you set up the Calendar Assistant application with Google OAuth and OpenAI integration.

## Prerequisites

1. **Docker and Docker Compose** - Make sure you have Docker and Docker Compose installed on your system
2. **Google Cloud Console Account** - For OAuth credentials
3. **OpenAI API Key** - For AI functionality

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

### 1.2 Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Calendar Assistant
   - User support email: Your email
   - Developer contact information: Your email
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Calendar Assistant
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
5. Download the credentials JSON file or note down:
   - Client ID
   - Client Secret

## Step 2: OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

## Step 3: Environment Configuration

1. Copy the environment template:

   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and fill in your credentials:

   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   SESSION_SECRET=generate_a_random_32_character_string
   ```

3. Generate a random session secret (32+ characters):

   ```bash
   # On Linux/Mac:
   openssl rand -base64 32

   # Or use any random string generator
   ```

## Step 4: Running the Application

### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production Mode

```bash
docker-compose up --build
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Step 5: First Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Sign in with Google"
3. Grant permissions to access your Google Calendar
4. You'll be redirected back to the application
5. Start using the AI assistant to manage your calendar!

## Troubleshooting

### Common Issues

#### 1. OAuth Error: "redirect_uri_mismatch"

- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3001/auth/google/callback`
- Check for extra spaces or typos

#### 2. "Failed to fetch calendar data"

- Ensure Google Calendar API is enabled in your Google Cloud project
- Check that your OAuth credentials are correct
- Verify the user has granted calendar permissions

#### 3. "Failed to generate AI response"

- Verify your OpenAI API key is correct
- Check that you have sufficient API credits
- Ensure the API key has access to GPT-3.5-turbo

#### 4. Docker Issues

- Make sure ports 3000 and 3001 are available
- Check Docker logs: `docker-compose logs`
- Try rebuilding: `docker-compose down && docker-compose up --build`

#### 5. CORS Errors

- Ensure the frontend is accessing the correct backend URL
- Check that the backend is running on port 3001

### Debug Commands

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild and restart
docker-compose down
docker-compose up --build

# Check environment variables
docker-compose exec backend env | grep -E "(GOOGLE|OPENAI|SESSION)"
```

## Security Notes

1. **Never commit your `.env` file** - It contains sensitive credentials
2. **Use strong session secrets** - Generate a random 32+ character string
3. **Keep API keys secure** - Don't share them or expose them in client-side code
4. **Regularly rotate credentials** - Update your API keys periodically

## Production Deployment

For production deployment, consider:

1. **HTTPS**: Use a reverse proxy (nginx) with SSL certificates
2. **Environment**: Set `NODE_ENV=production`
3. **Database**: Use a persistent database instead of session storage
4. **Monitoring**: Add logging and monitoring solutions
5. **Scaling**: Use container orchestration (Kubernetes, Docker Swarm)

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check auth status
- `POST /auth/logout` - Logout

### Calendar

- `GET /api/calendar/events?week=YYYY-MM-DD` - Get calendar events
- `GET /api/calendar/stats?week=YYYY-MM-DD` - Get meeting statistics

### Chat

- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history
- `POST /api/chat/draft-email` - Draft email
- `POST /api/chat/analyze-meetings` - Analyze meetings

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are installed and configured

## License

This project is for educational and personal use. Please respect the terms of service for Google Calendar API and OpenAI API.
