import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToUserChats, subscribeToMessages, sendMessage,
    setTypingStatus, subscribeToTyping, markMessagesAsRead,
    deleteMessage, getUserProfile
} from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, ArrowLeft, Image, MessageSquare, Loader2 } from 'lucide-react';

export default function Chat() {
    const { chatId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation(); // Get passed state (profile/uid)
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [otherUserProfile, setOtherUserProfile] = useState(state?.profile || null); // Initialize from state
    const [showActions, setShowActions] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Scroll handlers
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Use layout effect for initial scroll to avoid jump
    useLayoutEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('auto');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]); // Only on chat change

    // Auto-scroll on new message if near bottom
    useEffect(() => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom || messages[messages.length - 1]?.senderId === user.uid) {
            scrollToBottom();
        }
    }, [messages, user]);

    // Subscribe to chats
    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToUserChats(user.uid, setChats);
        return () => unsub();
    }, [user]);

    // Subscribe messages + typing
    useEffect(() => {
        if (!chatId || !user) return;
        const unsubMessages = subscribeToMessages(chatId, setMessages);
        const unsubTyping = subscribeToTyping(chatId, user.uid, setOtherTyping);
        markMessagesAsRead(chatId, user.uid);

        return () => {
            unsubMessages();
            unsubTyping();
            setTypingStatus(chatId, user.uid, false);
        };
    }, [chatId, user]);

    // Load profile
    useEffect(() => {
        if (!chatId || !chats.length || !user) return;
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            const otherUid = chat.participants?.find(p => p !== user.uid);
            if (otherUid) getUserProfile(otherUid).then(setOtherUserProfile);
        }
    }, [chatId, chats, user]);

    const handleTyping = useCallback((value) => {
        setNewMessage(value);
        if (!chatId || !user) return;
        setTypingStatus(chatId, user.uid, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(chatId, user.uid, false);
        }, 2000);
    }, [chatId, user]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate(5);
        if (!newMessage.trim() || !chatId || sending) return;
        setSending(true);
        const text = newMessage;
        setNewMessage('');
        setTypingStatus(chatId, user.uid, false);

        // Optimistic UI: add temp message
        const tempId = Date.now().toString();
        const tempMsg = {
            id: tempId,
            text,
            senderId: user.uid,
            createdAt: new Date(),
            pending: true
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await sendMessage(chatId, text, user.uid);
            // Real subscription will replace temp message shortly
        } catch (err) {
            console.error('Send error:', err);
            setNewMessage(text); // Restore text on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
        setSending(false);
    };

    const handleDelete = async (msgId) => {
        try {
            await deleteMessage(chatId, msgId);
            setShowActions(null);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        if (isNaN(date.getTime())) return '';
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    if (!chatId) return <ChatList chats={chats} user={user} navigate={navigate} />;



    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-card px-4 py-3 flex items-center gap-3 mb-2 shrink-0">
                <button onClick={() => navigate('/chat')} className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600">
                        {otherUserProfile?.photoURL ? (
                            <motion.img
                                layoutId={`avatar-${otherUserProfile.uid}`}
                                src={otherUserProfile.photoURL}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            otherUserProfile?.displayName?.charAt(0) || '?'
                        )}
                    </div>
                    {otherUserProfile?.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{otherUserProfile?.displayName || 'Chat'}</p>
                    <AnimatePresence mode="wait">
                        {otherTyping ? (
                            <motion.p key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-rose-400">
                                typing...
                            </motion.p>
                        ) : (
                            <motion.p key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-gray-400">
                                {otherUserProfile?.isOnline ? 'Active now' : 'Offline'}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center pt-20 text-gray-500 flex flex-col items-center">
                        <MessageSquare size={40} className="opacity-20 mb-2" />
                        <p>No messages yet</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.senderId === user.uid;
                    const msgDate = formatDate(msg.createdAt);
                    const prevDate = i > 0 ? formatDate(messages[i - 1].createdAt) : null;
                    const showDate = msgDate !== prevDate;

                    return (
                        <div key={msg.id || i}>
                            {showDate && (
                                <div className="flex justify-center my-4">
                                    <span className="text-[10px] bg-black/40 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                                        {msgDate}
                                    </span>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}
                            >
                                <div className="max-w-[75%] relative">
                                    <div
                                        onClick={() => isMe && !msg.deleted && setShowActions(showActions === msg.id ? null : msg.id)}
                                        className={`px-3 py-2 text-sm leading-relaxed cursor-pointer transition-transform active:scale-[0.98] ${isMe
                                            ? 'rounded-2xl rounded-br-sm text-white bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/10'
                                            : 'rounded-2xl rounded-bl-sm text-gray-100 bg-white/10'
                                            } ${msg.deleted ? 'italic opacity-60' : ''} ${msg.pending ? 'opacity-70' : ''}`}
                                    >
                                        {msg.text}
                                    </div>

                                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[9px] text-gray-500">{formatTime(msg.createdAt)}</span>
                                        {isMe && !msg.deleted && !msg.pending && (
                                            <span className="text-[9px] text-rose-400">✓✓</span>
                                        )}
                                        {msg.pending && <span className="text-[9px] text-gray-500">sending...</span>}
                                    </div>

                                    <AnimatePresence>
                                        {showActions === msg.id && isMe && !msg.deleted && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleDelete(msg.id)}
                                                className="absolute -top-8 right-0 bg-red-500/20 text-red-400 text-xs px-2 py-1.5 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="glass-card p-2 flex gap-2 mt-2 shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-colors placeholder-gray-600"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}

// Sub-component — fetches real profile data for each chat participant
function ChatList({ chats, user, navigate }) {
    const [profiles, setProfiles] = useState({});

    useEffect(() => {
        if (!chats.length || !user) return;
        let cancelled = false;

        const loadProfiles = async () => {
            const newProfiles = {};
            const uids = chats
                .map(c => c.participants?.find(p => p !== user.uid))
                .filter(Boolean)
                .filter(uid => !profiles[uid]); // skip already loaded

            const fetches = uids.map(async (uid) => {
                const profile = await getUserProfile(uid);
                if (profile) newProfiles[uid] = profile;
            });
            await Promise.all(fetches);
            if (!cancelled) setProfiles(prev => ({ ...prev, ...newProfiles }));
        };

        loadProfiles();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chats, user]);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <MessageSquare size={20} className="text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Messages</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your private conversations</p>
            </motion.div>

            <motion.div
                className="space-y-2"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                {chats.length === 0 ? (
                    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-center py-12">
                        <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-white font-medium">No conversations yet</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start chatting from Open to Talk!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/open-to-talk')}
                            className="btn-ruby mt-4 text-sm px-6 py-2 flex items-center gap-2 mx-auto"
                        >
                            <MessageSquare size={14} /> Find Someone to Chat
                        </motion.button>
                    </motion.div>
                ) : (
                    chats.map((chat) => {
                        const otherUid = chat.participants?.find(p => p !== user.uid);
                        const profile = profiles[otherUid];
                        const displayName = profile?.displayName || 'Loading...';
                        const unread = chat.unreadCount?.[user.uid] || 0;

                        return (
                            <motion.div
                                layout
                                key={chat.id}
                                variants={{
                                    hidden: { opacity: 0, y: 10, scale: 0.98 },
                                    show: { opacity: 1, y: 0, scale: 1 }
                                }}
                                whileHover={{ x: 5, scale: 1.01, transition: { type: 'spring', stiffness: 400 } }}
                                onClick={() => navigate(`/chat/${chat.id}`, { state: { profile, otherUid } })}
                                className="glass-card p-4 flex items-center gap-4 cursor-pointer group"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)' }}
                                    >
                                        {profile?.photoURL ? (
                                            <motion.img
                                                layoutId={`avatar-${otherUid}`}
                                                src={profile.photoURL}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {profile?.isOnline && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: 'var(--card-bg-solid)' }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-semibold truncate text-sm ${unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                                            {displayName}
                                        </h3>
                                        {chat.lastMessageTime && (
                                            <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-soft)' }}>
                                                {(() => {
                                                    try {
                                                        const d = chat.lastMessageTime.toDate();
                                                        const today = new Date();
                                                        if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        return d.toLocaleDateString();
                                                    } catch { return ''; }
                                                })()}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate pr-4 ${unread > 0 ? 'text-gray-300 font-medium' : ''}`} style={{ color: unread > 0 ? undefined : 'var(--text-muted)' }}>
                                        {chat.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                                {unread > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5"
                                        style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}
                                    >
                                        {unread > 9 ? '9+' : unread}
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </motion.div>
        </div>
    );
}
