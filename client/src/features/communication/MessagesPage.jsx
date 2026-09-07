import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Send, 
  User, 
  Search, 
  Clock, 
  Check, 
  CheckCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const { showError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeRecipient) {
      loadMessages(activeRecipient._id);
      const interval = setInterval(() => {
        pollMessages(activeRecipient._id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeRecipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/communication/conversations');
      const users = res.data.data || [];
      setConversations(users);
      if (users.length > 0 && !activeRecipient) {
        setActiveRecipient(users[0]);
      }
    } catch (err) {
      console.error('Error fetching chat users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadMessages = async (recipientId) => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`/api/communication/messages/${recipientId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const pollMessages = async (recipientId) => {
    try {
      const res = await axios.get(`/api/communication/messages/${recipientId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      // silent poll fail
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRecipient) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await axios.post('/api/communication/messages', {
        recipientId: activeRecipient._id,
        content: textToSend
      });
      setMessages(prev => [...prev, res.data.data]);
    } catch (err) {
      showError('Failed to send message');
      setInputText(textToSend); // restore on error
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = conversations.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    return fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Team Communication &amp; Dispatch Chat</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          Secure, direct 1-to-1 operational messaging with team members across departments.
        </p>
      </div>

      {/* Two-Pane Messenger Layout */}
      <div className="card" style={{ padding: 0, display: 'flex', flex: 1, overflow: 'hidden', minHeight: 450 }}>
        {/* Left Pane: Contacts */}
        <div style={{ width: 320, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface-alt)' }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingUsers ? (
              <div style={{ padding: '1rem' }}>
                <SkeletonLoader count={4} height={44} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active colleagues found.
              </div>
            ) : (
              filteredUsers.map(user => {
                const isActive = activeRecipient?._id === user._id;
                return (
                  <div
                    key={user._id}
                    onClick={() => setActiveRecipient(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {user.role ? user.role.toLowerCase().replace('_', ' ') : 'Staff'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation History & Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          {activeRecipient ? (
            <>
              {/* Recipient Header */}
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                    {activeRecipient.firstName ? activeRecipient.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{activeRecipient.firstName} {activeRecipient.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeRecipient.email}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  Operational Channel
                </span>
              </div>

              {/* Message Feed */}
              <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loadingMessages ? (
                  <SkeletonLoader count={3} height={50} />
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No messages yet. Send a direct operational update.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender === currentUser?._id;
                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '0.625rem 0.875rem',
                            borderRadius: isMine ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                            background: isMine ? '#2563EB' : 'var(--bg-surface-alt)',
                            color: isMine ? '#FFFFFF' : 'var(--text-primary)',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {msg.content}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && (
                            msg.isRead ? <CheckCheck size={12} color="#2563EB" /> : <Check size={12} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder={`Message ${activeRecipient.firstName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 0.875rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !inputText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0 }}>Select a team member from the contacts list to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
