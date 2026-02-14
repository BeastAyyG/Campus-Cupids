import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    subscribeToActiveUsers, subscribeToUserChats,
    getTotalUnreadCount, subscribeToUserProfile
} from '../lib/db';
import {
    collection, query, where, onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';

import {
    Users, Radio, Heart, Mail, Megaphone, User,
    Wifi, Inbox, Eye, Send, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeCount, setActiveCount] = useState(0);
    const [chatCount, setChatCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [crushCount, setCrushCount] = useState(0);
    const [admirerCount, setAdmirerCount] = useState(0);


    useEffect(() => {
        if (!user) return;
        const unsubs = [];

        unsubs.push(subscribeToUserProfile(user.uid, setProfile));
        unsubs.push(subscribeToActiveUsers((users) => setActiveCount(users.length)));
        unsubs.push(subscribeToUserChats(user.uid, (chats) => {
            setChatCount(chats.length);
            setUnreadCount(getTotalUnreadCount(chats, user.uid));
        }));

        const crushQ = query(collection(db, 'crushes'), where('senderUid', '==', user.uid));
        unsubs.push(onSnapshot(crushQ, (snap) => setCrushCount(snap.size)));

        const admirerQ = query(collection(db, 'crushes'), where('targetEmail', '==', user.email));
        unsubs.push(onSnapshot(admirerQ, (snap) => setAdmirerCount(snap.size)));

        return () => unsubs.forEach(u => u());
    }, [user]);



    const stats = [
        { icon: Wifi, label: 'Online Now', value: activeCount, color: '#22c55e' },
        { icon: Inbox, label: 'Unread', value: unreadCount, color: 'var(--accent)' },
        { icon: Eye, label: 'Admirers', value: admirerCount, color: '#f59e0b' },
        { icon: Send, label: 'Crushes Sent', value: crushCount, color: '#ec4899' },
    ];

    const features = [
        {
            title: 'Friendship Groups',
            desc: 'Join interest-based communities',
            path: '/friendship',
            icon: Users,
            stat: null,
            accent: '#3b82f6',
        },
        {
            title: 'Open to Talk',
            desc: 'Go live and meet campus people',
            path: '/open-to-talk',
            icon: Radio,
            stat: `${activeCount} online`,
            accent: '#22c55e',
        },
        {
            title: 'Anonymous Crush',
            desc: 'Send secret crushes — reveal on match',
            path: '/crush',
            icon: Heart,
            stat: `${admirerCount} admirer${admirerCount !== 1 ? 's' : ''}`,
            accent: '#ec4899',
        },
        {
            title: 'Messages',
            desc: 'Your private conversations',
            path: '/chat',
            icon: Mail,
            stat: unreadCount > 0 ? `${unreadCount} unread` : `${chatCount} chat${chatCount !== 1 ? 's' : ''}`,
            accent: '#f59e0b',
        },
        {
            title: 'Campus Buzz',
            desc: 'Anonymous confessions & hot takes',
            path: '/buzz',
            icon: Megaphone,
            stat: 'Live feed',
            accent: '#f97316',
        },
        {
            title: 'My Profile',
            desc: 'Customize your campus identity',
            path: '/profile',
            icon: User,
            stat: profile?.interests?.length ? `${profile.interests.length} interests` : 'Setup now',
            accent: '#8b5cf6',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
                <h1 className="text-2xl font-extrabold text-white mb-1">
                    Hey, {user?.displayName?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Welcome back to Campus Cupids. Here&apos;s what&apos;s happening.
                </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-4 text-center cursor-default"
                        >
                            <Icon size={18} className="mx-auto mb-2 opacity-60" style={{ color: s.color }} />
                            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-soft)' }}>{s.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 80, damping: 15 }}
                            whileHover={{ y: -8 }}
                            onClick={() => navigate(feature.path)}
                            className="glass-card-hover p-6 flex flex-col group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                    style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}25` }}
                                >
                                    <Icon size={20} style={{ color: feature.accent }} />
                                </div>
                                {feature.stat && (
                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                        {feature.stat}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-white mb-1 group-hover:text-gradient-ruby transition-all duration-300">{feature.title}</h3>
                            <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                                <span className="group-hover:mr-1 transition-all duration-300">Open</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>


        </div>
    );
}
