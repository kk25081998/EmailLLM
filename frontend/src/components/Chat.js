import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2, BarChart3, Users, Bot, User } from 'lucide-react';
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
            setError('Could not load chat history.');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e, messageOverride) => {
        if(e) e.preventDefault();
        const messageToSend = messageOverride || inputMessage.trim();
        if (!messageToSend || loading) return;

        setInputMessage('');
        setLoading(true);
        setError(null);

        const tempUserMessage = {
            id: Date.now(),
            userMessage: messageToSend,
            aiResponse: null,
            timestamp: new Date().toISOString(),
            isTemp: true
        };

        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const response = await chatAPI.sendMessage(messageToSend);
            setMessages(prev => prev.map(msg =>
                msg.id === tempUserMessage.id
                    ? { ...msg, aiResponse: response.data.response, isTemp: false }
                    : msg
            ));
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === tempUserMessage.id
                    ? { ...msg, aiResponse: 'Sorry, I encountered an error. Please try again.', isError: true, isTemp: false }
                    : msg
            ));
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

    const handleQuickActions = (action) => {
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
        handleSendMessage(null, message);
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

    const renderMessageContent = (content) => {
      if (typeof content !== 'string') return null;
      return content.split('\n').map((line, index) => (
          <span key={index}>{line}<br/></span>
      ));
    };

    return (
        <div style={{ 
            height: '850px', 
            maxHeight: '850px',
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#f0f4f8',
            overflow: 'hidden' // Prevent outer container from scrolling
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                flexShrink: 0 // Prevent header from shrinking
            }}>
                <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                    <MessageCircle size={24} color="#4f46e5" />
                    AI Assistant
                </h2>
                <button
                    className="btn btn-secondary"
                    onClick={handleClearHistory}
                    style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: '#eef2ff', cursor: 'pointer' }}
                    title="Clear chat history"
                >
                    <Trash2 size={18} color="#4f46e5" />
                </button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                minHeight: 0 // Critical for proper flex scrolling
            }}>
                {messages.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', marginTop: '4rem', padding: '0 2rem' }}>
                        <MessageCircle size={56} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                        <h3 style={{fontSize: '1.2rem', fontWeight: 500}}>Start a conversation</h3>
                        <p>Ask me anything about your schedule, emails, or meetings!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} style={{ marginBottom: '1.5rem' }}>
                            {/* User Message */}
                             {message.userMessage && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{
                                        background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                                        color: 'white',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '1.25rem 1.25rem 0.25rem 1.25rem',
                                        maxWidth: '75%',
                                        wordWrap: 'break-word',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}>
                                        {renderMessageContent(message.userMessage)}
                                    </div>
                                    <div style={{ flexShrink: 0, background: '#d1d5db', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#ffffff"/></div>
                                </div>
                            )}

                            {/* AI Response */}
                            {(message.aiResponse || message.isTemp) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1rem' }}>
                                     <div style={{ flexShrink: 0, background: '#6366f1', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color="#ffffff"/></div>
                                    <div style={{
                                        background: message.isError ? '#fee2e2' : '#ffffff',
                                        color: message.isError ? '#b91c1c' : '#334155',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
                                        maxWidth: '75%',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.6',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}>
                                        {message.isTemp ? <LoadingSpinner size="small" text="Thinking..." /> : renderMessageContent(message.aiResponse)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                {error && <div style={{ textAlign: 'center', color: '#b91c1c', marginTop: '1rem' }}>{error}</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ 
                padding: '1rem 1.5rem', 
                borderTop: '1px solid #e2e8f0', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(10px)',
                flexShrink: 0 // Prevent input area from shrinking
            }}>
                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {[
                      { key: 'meetings', label: 'Meeting Time', icon: MessageCircle },
                      { key: 'optimize', label: 'Optimize Schedule', icon: BarChart3 },
                      // { key: 'attendees', label: 'Recent Attendees', icon: Users },
                    ].map(action => (
                      <button
                        key={action.key}
                        className="btn btn-secondary"
                        onClick={() => handleQuickActions(action.key)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        style={{
                            flex: 1,
                            padding: '0.75rem 1.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '1.5rem',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!inputMessage.trim() || loading}
                        style={{ padding: '0.85rem', borderRadius: '50%', background: '#4f46e5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Send size={20} color="white"/>
                    </button>
                </form>
            </div>

            {/* Meeting Analysis Modal */}
            {showAnalysisModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '600px',
                        width: '90%', maxHeight: '80vh', overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} /> Meeting Analysis
                        </h3>
                        {!analysisData ? (
                            <div>
                                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                                    Get detailed insights about your meeting patterns, time management, and optimization suggestions.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowAnalysisModal(false)} > Cancel </button>
                                    <button className="btn btn-primary" onClick={handleMeetingAnalysis} disabled={analysisLoading}>
                                        {analysisLoading ? 'Analyzing...' : 'Analyze Meetings'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {analysisData.stats && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ marginBottom: '0.5rem' }}>Meeting Statistics</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {analysisData.stats.totalMeetings} </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Meetings</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {analysisData.stats.totalHours.toFixed(1)} </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hours in Meetings</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {analysisData.stats.averageMeetingLength.toFixed(1)} </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg Hours</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {analysisData.stats.uniqueAttendees} </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Unique Attendees</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {analysisData.analysis}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" onClick={() => { setShowAnalysisModal(false); setAnalysisData(null); }}>
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
