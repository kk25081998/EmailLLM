import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2, BarChart3, Users } from 'lucide-react';
import { chatAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      setMessages(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setError(null);

    // Add user message immediately
    const tempUserMessage = {
      id: Date.now(),
      userMessage,
      aiResponse: null,
      timestamp: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await chatAPI.sendMessage(userMessage);
      
      // Update the message with AI response
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id 
          ? { ...msg, aiResponse: response.data.response, isTemp: false }
          : msg
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatAPI.clearHistory();
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
      setError('Failed to clear chat history');
    }
  };

  const handleQuickActions = async (action) => {
    let message = '';
    switch (action) {
      case 'meetings':
        message = 'How much time am I spending in meetings?';
        break;
      case 'optimize':
        message = 'How can I optimize my schedule?';
        break;
      case 'email':
        message = 'Can you help me draft a professional email to schedule a meeting? Please include a subject line and make it concise and professional.';
        break;
      case 'analysis':
        setShowAnalysisModal(true);
        return;
      case 'attendees':
        message = 'Show me my recent meeting attendees and suggest who I should follow up with';
        break;
      case 'recipients':
        message = 'Can you suggest who I should email based on my recent meetings?';
        break;
      default:
        return;
    }
    
    // Automatically send the message instead of just setting it
    if (message && !loading) {
      setLoading(true);
      setError(null);

      // Add user message immediately
      const tempUserMessage = {
        id: Date.now(),
        userMessage: message,
        aiResponse: null,
        timestamp: new Date().toISOString(),
        isTemp: true
      };

      setMessages(prev => [...prev, tempUserMessage]);

      try {
        const response = await chatAPI.sendMessage(message);
        
        // Update the message with AI response
        setMessages(prev => prev.map(msg => 
          msg.id === tempUserMessage.id 
            ? { ...msg, aiResponse: response.data.response, isTemp: false }
            : msg
        ));
      } catch (error) {
        console.error('Failed to send quick action message:', error);
        setError('Failed to send message. Please try again.');
        
        // Remove the temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMeetingAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      const response = await chatAPI.analyzeMeetings();
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Failed to analyze meetings:', error);
      setError('Failed to analyze meetings. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };



  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={20} />
          AI Assistant
        </h2>
        <button 
          className="btn btn-secondary"
          onClick={handleClearHistory}
          style={{ padding: '0.5rem', fontSize: '0.8rem' }}
          title="Clear chat history"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b' }}>
          Quick Actions:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'meetings', label: 'Meeting Time', icon: MessageCircle },
            { key: 'optimize', label: 'Optimize Schedule', icon: BarChart3 },
            { key: 'email', label: 'Draft Email', icon: MessageCircle },
            { key: 'analysis', label: 'Meeting Analysis', icon: BarChart3 },
            { key: 'attendees', label: 'Attendee Insights', icon: Users },
            { key: 'recipients', label: 'Email Suggestions', icon: MessageCircle }
          ].map(action => (
            <button
              key={action.key}
              className="btn btn-secondary"
              onClick={() => handleQuickActions(action.key)}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error" style={{ margin: '1rem' }}>
          {error}
        </div>
      )}

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.length === 0 && !loading ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#64748b', 
            marginTop: '2rem',
            fontSize: '0.9rem'
          }}>
            <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Start a conversation with your AI assistant!</p>
            <p>Ask about your meetings, schedule optimization, or request email drafts.</p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <p><strong>Try asking:</strong></p>
              <p>"Can you draft an email to schedule a meeting with john@example.com?"</p>
              <p>"Help me write a follow-up email to my recent meeting attendees"</p>
              <p>"How much time am I spending in meetings this week?"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {/* User Message */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px 12px 4px 12px',
                  maxWidth: '70%',
                  wordWrap: 'break-word'
                }}>
                  {message.userMessage}
                </div>
              </div>

              {/* AI Response */}
              {message.aiResponse && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    color: '#1e293b',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px 12px 12px 4px',
                    maxWidth: '70%',
                    wordWrap: 'break-word',
                    lineHeight: '1.5'
                  }}>
                    {message.aiResponse}
                  </div>
                </div>
              )}

              {/* Loading indicator for temp messages */}
              {message.isTemp && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px 12px 12px 4px',
                    maxWidth: '70%'
                  }}>
                    <LoadingSpinner size="small" text="AI is thinking..." />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ 
        padding: '1rem', 
        borderTop: '1px solid #e2e8f0',
        background: 'white'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your calendar, meetings, or request email drafts..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!inputMessage.trim() || loading}
            style={{ padding: '0.75rem 1rem' }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Meeting Analysis Modal */}
      {showAnalysisModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} />
              Meeting Analysis
            </h3>
            
            {!analysisData ? (
              <div>
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  Get detailed insights about your meeting patterns, time management, and optimization suggestions.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAnalysisModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleMeetingAnalysis}
                    disabled={analysisLoading}
                  >
                    {analysisLoading ? 'Analyzing...' : 'Analyze Meetings'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {analysisData.stats && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Meeting Statistics</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                          {analysisData.stats.totalMeetings}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Meetings</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                          {analysisData.stats.totalHours.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hours in Meetings</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                          {analysisData.stats.averageMeetingLength.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg Hours</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                          {analysisData.stats.uniqueAttendees}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Unique Attendees</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {analysisData.analysis}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAnalysisModal(false);
                      setAnalysisData(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default Chat; 