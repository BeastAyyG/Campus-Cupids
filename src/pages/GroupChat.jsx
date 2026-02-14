import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToGroupMessages, sendGroupMessage, getGroupInfo } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare, Loader2, Users } from 'lucide-react';

const CATEGORY_EMOJIS = {
    'Study': '📚', 'Sports': '⚽', 'Music': '🎵', 'Anime': '🎌',
    'Gaming': '🎮', 'Coding': '💻', 'Social': '🎉', 'Other': '✨',
};

export default function GroupChat() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [groupInfo, setGroupInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!groupId) return;
        getGroupInfo(groupId).then(setGroupInfo);
    }, [groupId]);

    // Scroll handlers
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Initial scroll (instant)
    useLayoutEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('auto');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    // Auto-scroll on new message if near bottom
    useEffect(() => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom || messages[messages.length - 1]?.senderId === user.uid) {
            scrollToBottom();
        }
    }, [messages, user]);

    useEffect(() => {
        if (!groupId) return;
        const unsub = subscribeToGroupMessages(groupId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsub();
    }, [groupId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        setSending(true);
        const text = newMessage;
        setNewMessage('');

        // Optimistic UI
        const tempId = Date.now().toString();
        const tempMsg = {
            id: tempId,
            text,
            senderId: user.uid,
            senderName: user.displayName,
            createdAt: new Date(),
            pending: true
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await sendGroupMessage(groupId, text, user.uid, user.displayName);
        } catch (err) {
            console.error('Group send error:', err);
            setNewMessage(text);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
        setSending(false);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };



    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-card px-4 py-3 flex items-center gap-3 mb-2 shrink-0">
                <button onClick={() => navigate('/friendship')} className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-gradient-to-br from-rose-500 to-pink-600">
                    {CATEGORY_EMOJIS[groupInfo?.category] || '✨'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{groupInfo?.name || 'Group Chat'}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Users size={10} /> {groupInfo?.memberCount || 0} members
                    </p>
                </div>
            </motion.div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center py-10 opacity-50 flex flex-col items-center">
                        <MessageSquare size={32} className="mb-2 opacity-30" />
                        <p className="text-sm">Welcome to the group!</p>
                        <p className="text-xs">Say hello to everyone.</p>
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
                                <div className="flex items-center justify-center my-4">
                                    <span className="text-[10px] bg-black/40 text-gray-400 px-3 py-1 rounded-full border border-white/5">
                                        {msgDate}
                                    </span>
                                </div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                                <div className="max-w-[75%]">
                                    {!isMe && (
                                        <p className="text-[10px] font-bold mb-0.5 ml-3 text-rose-400">
                                            {msg.senderName || 'User'}
                                        </p>
                                    )}
                                    <div
                                        className={`px-4 py-2.5 text-sm leading-relaxed ${isMe
                                            ? 'rounded-2xl rounded-br-sm text-white bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/10'
                                            : 'glass-card rounded-2xl rounded-bl-sm text-gray-200 bg-white/10'
                                            } ${msg.pending ? 'opacity-70' : ''}`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[9px] text-gray-500">{formatTime(msg.createdAt)}</span>
                                        {msg.pending && <span className="text-[9px] text-gray-500">sending...</span>}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="glass-card p-2 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message the group..."
                    maxLength={2000}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-rose-500/50 transition-colors placeholder-gray-600"
                />
                <motion.button whileTap={{ scale: 0.95 }} type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </motion.button>
            </form>
        </div>
    );
}
