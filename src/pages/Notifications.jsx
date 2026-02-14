import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications, markNotificationRead, clearAllNotifications } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Heart, ThumbsUp, Megaphone, Inbox, Trash2 } from 'lucide-react';

const NOTIF_ICONS = {
    MESSAGE: { icon: MessageSquare, color: '#3b82f6' },
    CRUSH: { icon: Heart, color: '#ec4899' },
    LIKE: { icon: ThumbsUp, color: '#ef4444' },
    DEFAULT: { icon: Megaphone, color: '#f59e0b' },
};

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToNotifications(user.uid, (notifs) => {
            setNotifications(notifs);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleRead = async (id) => {
        await markNotificationRead(user.uid, id);
    };

    const handleClearAll = async () => {
        if (!notifications.length) return;
        if (confirm('Clear all notifications?')) {
            await clearAllNotifications(user.uid, notifications);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
                        <Bell size={20} className="text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Activity</h1>
                </div>
                <div className="flex justify-between items-center mb-4 px-4">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Stay in the loop</p>
                    {notifications.length > 0 && (
                        <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer">
                            <Trash2 size={11} /> Clear All
                        </button>
                    )}
                </div>
            </motion.div>

            {/* List */}
            {/* List */}
            <motion.div
                layout
                className="space-y-3"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode="popLayout">
                    {notifications.map((notif) => {
                        const notifStyle = NOTIF_ICONS[notif.type] || NOTIF_ICONS.DEFAULT;
                        const Icon = notifStyle.icon;
                        return (
                            <motion.div
                                layout
                                key={notif.id}
                                variants={{
                                    hidden: { opacity: 0, x: -20, scale: 0.95 },
                                    show: { opacity: 1, x: 0, scale: 1 },
                                    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
                                }}
                                whileHover={{ scale: 1.02, x: 4, transition: { type: 'spring', stiffness: 400 } }}
                                className={`glass-card p-4 relative overflow-hidden group cursor-pointer ${!notif.read ? 'border-l-4 border-l-rose-500' : ''}`}
                                style={{ background: notif.read ? 'rgba(18,12,16,0.4)' : 'rgba(18,12,16,0.8)' }}
                            >
                                <Link to={notif.link || '#'} onClick={() => handleRead(notif.id)} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                                        style={{ background: `${notifStyle.color}15`, border: `1px solid ${notifStyle.color}25` }}>
                                        <Icon size={16} style={{ color: notifStyle.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                            {notif.body}
                                        </p>
                                        <p className="text-[10px] mt-2 opacity-60">
                                            {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-4 right-4 animate-pulse"></span>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {notifications.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-center py-12">
                        <Inbox size={36} className="mx-auto mb-3 opacity-30" />
                        <p>All caught up! No new activity.</p>
                    </motion.div>
                )}
            </motion.div>

        </div >
    );
}
