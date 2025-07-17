import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2, BarChart3, Users, Bot, User } from 'lucide-react';
import { chatAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './Chat.css';

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
        if (e) e.preventDefault();
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
            <span key={index}>{line}<br /></span>
        ));
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h2 className="chat-header-title">
                    <div className="chat-header-icon">
                        <MessageCircle size={20} />
                    </div>
                    AI Assistant
                </h2>
                <div className="chat-header-actions">
                    <button
                        className="chat-clear-button"
                        onClick={handleClearHistory}
                        title="Clear chat history"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
                {messages.length === 0 && !loading ? (
                    <div className="chat-empty-state">
                        <MessageCircle size={56} className="chat-empty-icon" />
                        <h3 className="chat-empty-title">Start a conversation</h3>
                        <p className="chat-empty-description">Ask me anything about your schedule, emails, or meetings!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className="chat-message">
                            {/* User Message */}
                            {message.userMessage && (
                                <div className="chat-message-user">
                                    <div className="chat-message-bubble chat-message-bubble-user">
                                        {renderMessageContent(message.userMessage)}
                                    </div>
                                    <div className="chat-message-avatar chat-message-avatar-user">
                                        <User size={20} />
                                    </div>
                                </div>
                            )}

                            {/* AI Response */}
                            {(message.aiResponse || message.isTemp) && (
                                <div className="chat-message-ai">
                                    <div className="chat-message-avatar chat-message-avatar-ai">
                                        <Bot size={20} />
                                    </div>
                                    <div className={`chat-message-bubble chat-message-bubble-ai ${message.isError ? 'error' : ''}`}>
                                        {message.isTemp ? <LoadingSpinner size="small" text="Thinking..." /> : renderMessageContent(message.aiResponse)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                {error && <div className="chat-error">{error}</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                {/* Quick Actions */}
                <div className="chat-quick-actions">
                    {[
                        { key: 'meetings', label: 'Meeting Time', icon: MessageCircle },
                        { key: 'optimize', label: 'Optimize Schedule', icon: BarChart3 },
                        // { key: 'attendees', label: 'Recent Attendees', icon: Users },
                    ].map(action => (
                        <button
                            key={action.key}
                            className="chat-quick-action"
                            onClick={() => handleQuickActions(action.key)}
                        >
                            <action.icon size={14} />
                            {action.label}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-form">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="chat-input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="chat-send-button"
                        disabled={!inputMessage.trim() || loading}
                    >
                        <Send size={20} />
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
