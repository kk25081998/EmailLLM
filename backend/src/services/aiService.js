const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateResponse(message, calendarData = null) {
    try {
      let systemPrompt = `You are a helpful calendar assistant. You help users manage their schedule, analyze their calendar data, and provide insights about their meetings and time management.`;

      if (calendarData) {
        systemPrompt += `\n\nCurrent calendar context:
- Total events: ${calendarData.events?.length || 0}
- Meeting statistics: ${JSON.stringify(calendarData.stats || {}, null, 2)}
- Recent events: ${JSON.stringify(calendarData.events?.slice(0, 5) || [], null, 2)}

Use this calendar data to provide specific, personalized responses.`;

        // Add attendee information if available
        if (calendarData.attendees && calendarData.attendees.length > 0) {
          systemPrompt += `\n\nAvailable attendees for this week:
${calendarData.attendees.map(attendee => 
  `- ${attendee.displayName} (${attendee.email}) - ${attendee.meetings.length} meetings`
).join('\n')}`;
        }
      }

      systemPrompt += `\n\nYou can help with:
1. Analyzing meeting patterns and time spent in meetings
2. Drafting professional emails for scheduling meetings
3. Suggesting schedule optimizations and time blocking strategies
4. Providing insights about meeting frequency and duration
5. Helping with calendar organization and productivity tips
6. Suggesting email recipients from meeting attendees
7. Analyzing attendee patterns and meeting dynamics

IMPORTANT: When users ask for email drafting, provide a complete, professional email draft directly in your response. Include:
- Subject line
- Professional greeting
- Clear purpose and context
- Request for availability or action
- Professional closing
- Your name

If they mention a specific recipient, use that. If they mention recent meeting attendees, suggest drafting to those people. Always be conversational, helpful, and provide actionable advice.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate AI response');
    }
  }



  async analyzeMeetings(calendarData) {
    try {
      let attendeeContext = '';
      
      if (calendarData && calendarData.attendees) {
        attendeeContext = `\n\nAttendee Analysis:
- Total unique attendees: ${calendarData.attendees.length}
- Most frequent attendees: ${calendarData.attendees.slice(0, 3).map(a => `${a.displayName} (${a.meetings.length} meetings)`).join(', ')}
- Attendee distribution: ${calendarData.attendees.length > 0 ? 'Varied' : 'Limited'}`;
      }

      const prompt = `Analyze the following meeting data and provide insights:
      
      Meeting Statistics:
      - Total meetings: ${calendarData.stats?.totalMeetings || 0}
      - Total hours: ${calendarData.stats?.totalHours || 0}
      - Average meeting length: ${calendarData.stats?.averageMeetingLength || 0} hours
      - Meetings by day: ${JSON.stringify(calendarData.stats?.meetingsByDay || {})}
      - Total attendees: ${calendarData.stats?.totalAttendees || 0}
      - Unique attendees: ${calendarData.stats?.uniqueAttendees || 0}
      - Average attendees per meeting: ${calendarData.stats?.averageAttendeesPerMeeting || 0}${attendeeContext}
      
      Provide insights about:
      1. Meeting patterns and efficiency
      2. Attendee engagement and collaboration
      3. Potential optimizations
      4. Time management suggestions
      5. Productivity recommendations
      6. Communication patterns with attendees`;

      return await this.generateResponse(prompt, calendarData);
    } catch (error) {
      console.error('Meeting analysis error:', error);
      throw new Error('Failed to analyze meetings');
    }
  }

  async analyzeAttendeePatterns(calendarData) {
    try {
      if (!calendarData || !calendarData.attendees) {
        return "No attendee data available for analysis.";
      }

      const prompt = `Analyze the attendee patterns from your recent meetings:

${calendarData.attendees.map(attendee => 
  `- ${attendee.displayName} (${attendee.email}): ${attendee.meetings.length} meetings
  Recent meetings: ${attendee.meetings.slice(0, 3).map(m => m.title).join(', ')}`
).join('\n\n')}

Provide insights about:
1. Most frequent collaborators
2. Meeting types and purposes
3. Communication patterns
4. Potential for relationship building
5. Suggestions for follow-up communications`;

      return await this.generateResponse(prompt, calendarData);
    } catch (error) {
      console.error('Attendee pattern analysis error:', error);
      throw new Error('Failed to analyze attendee patterns');
    }
  }
}

module.exports = AIService; 