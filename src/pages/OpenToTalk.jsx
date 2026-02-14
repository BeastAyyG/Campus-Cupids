import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    updateUserStatus, subscribeToActiveUsers, getOrCreateChat,
    blockUser, reportUser, subscribeToMyBlocks,
    getUserProfile, calculateMatchPercentage
} from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radio, MessageSquare, Clock, Users, Loader2,
    UserX, AlertTriangle, X, Send, ShieldBan, Heart
} from 'lucide-react';

export default function OpenToTalk() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockedIds, setBlockedIds] = useState([]);
    const [reportModal, setReportModal] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [myProfile, setMyProfile] = useState(null);
    const [userProfiles, setUserProfiles] = useState({});

    useEffect(() => {
        const unsub = subscribeToActiveUsers((users) => {
            setActiveUsers(users);
            const me = users.find(u => u.uid === user?.uid);
            if (me) setIsOpen(true);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToMyBlocks(user.uid, setBlockedIds);
        return () => unsub();
    }, [user]);

    // Fetch my profile for interests matching
    useEffect(() => {
        if (!user) return;
        getUserProfile(user.uid).then(setMyProfile);
    }, [user]);

    // Fetch profiles of active users for match calculation
    useEffect(() => {
        if (!activeUsers.length || !user) return;
        let cancelled = false;
        const fetchProfiles = async () => {
            const newProfiles = {};
            const uidsToFetch = activeUsers
                .filter(u => u.uid !== user.uid && !userProfiles[u.uid])
                .map(u => u.uid);
            await Promise.all(uidsToFetch.map(async (uid) => {
                const profile = await getUserProfile(uid);
                if (profile) newProfiles[uid] = profile;
            }));
            if (!cancelled) setUserProfiles(prev => ({ ...prev, ...newProfiles }));
        };
        fetchProfiles();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeUsers, user]);

    const getMatchScore = (otherUid) => {
        if (!myProfile?.interests?.length) return 0;
        const theirProfile = userProfiles[otherUid];
        if (!theirProfile?.interests?.length) return 0;
        return calculateMatchPercentage(myProfile.interests, theirProfile.interests);
    };

    const getSharedInterests = (otherUid) => {
        if (!myProfile?.interests?.length) return [];
        const theirProfile = userProfiles[otherUid];
        if (!theirProfile?.interests?.length) return [];
        return myProfile.interests.filter(i => theirProfile.interests.includes(i));
    };

    const handleToggle = useCallback(async () => {
        if (navigator.vibrate) navigator.vibrate(10);
        const newState = !isOpen;
        setIsOpen(newState);
        await updateUserStatus(user.uid, newState, {
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
        });
    }, [isOpen, user]);

    const handleChat = useCallback(async (otherUid) => {
        try {
            const chatId = await getOrCreateChat(user.uid, otherUid);
            navigate(`/chat/${chatId}`);
        } catch (err) {
            console.error('Chat creation error:', err);
        }
    }, [user, navigate]);

    const handleBlock = async (blockedId) => {
        try {
            await blockUser(user.uid, blockedId);
        } catch (err) {
            console.error('Block error:', err);
        }
    };

    const handleReport = async () => {
        if (!reportModal || !reportReason.trim()) return;
        try {
            await reportUser(user.uid, reportModal, reportReason);
            setReportModal(null);
            setReportReason('');
        } catch (err) {
            console.error('Report error:', err);
        }
    };

    const otherUsers = activeUsers.filter(u => u.uid !== user?.uid && !blockedIds.includes(u.uid));


    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <Radio size={20} className="text-green-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Open to Talk</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Let others know you&apos;re down to chat</p>
            </motion.div>

            {/* Toggle Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card p-7 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {isOpen ? <><span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /> You are Open to Talk</> : <><Clock size={16} className="text-gray-500" /> You are Offline</>}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {isOpen ? 'Auto-expires in 48 hours' : 'Toggle to start connecting'}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggle}
                        className="relative w-14 h-7 rounded-full transition-all duration-400 cursor-pointer"
                        style={{ background: isOpen ? 'linear-gradient(90deg, #22c55e, #10b981)' : '#2d2028', boxShadow: isOpen ? '0 0 25px rgba(34,197,94,0.4)' : 'none' }}
                        aria-label="Toggle availability"
                    >
                        <motion.div
                            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"
                            animate={{ left: isOpen ? '1.75rem' : '0.125rem' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        />
                    </motion.button>
                </div>
            </motion.div>

            {/* Active Users */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Users size={15} className="opacity-60" /> People Available
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                            {otherUsers.length}
                        </span>
                    </h3>
                </div>

                <div className="space-y-2">
                    <AnimatePresence>
                        {loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
                                <Loader2 size={28} className="mx-auto animate-spin opacity-40" style={{ color: 'var(--accent)' }} />
                                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Loading users...</p>
                            </motion.div>
                        ) : otherUsers.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-14 text-center">
                                <Radio size={36} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium text-white">No one&apos;s online yet</p>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Be the first to go online!</p>
                            </motion.div>
                        ) : (
                            otherUsers
                                .map(u => ({ ...u, matchScore: getMatchScore(u.uid) }))
                                .sort((a, b) => b.matchScore - a.matchScore)
                                .map((u, i) => {
                                    const matchScore = u.matchScore;
                                    const shared = getSharedInterests(u.uid);
                                    const theirProfile = userProfiles[u.uid];

                                    return (
                                        <motion.div
                                            key={u.uid}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ x: 5, scale: 1.01 }}
                                            className="glass-card p-4 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <motion.div
                                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                                        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                                                        style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)' }}
                                                    >
                                                        {u.photoURL ? (
                                                            <img src={u.photoURL} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            u.displayName?.charAt(0) || '?'
                                                        )}
                                                    </motion.div>
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ border: '2px solid var(--card-bg-solid)' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white text-sm truncate">{u.displayName || 'Anonymous'}</p>
                                                        {matchScore > 0 && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                                                style={{
                                                                    background: matchScore >= 60 ? 'rgba(34,197,94,0.12)' : matchScore >= 30 ? 'rgba(251,191,36,0.12)' : 'var(--accent-dim)',
                                                                    color: matchScore >= 60 ? '#22c55e' : matchScore >= 30 ? '#fbbf24' : 'var(--accent)',
                                                                    border: `1px solid ${matchScore >= 60 ? 'rgba(34,197,94,0.2)' : matchScore >= 30 ? 'rgba(251,191,36,0.2)' : 'rgba(255,59,92,0.15)'}`,
                                                                }}
                                                            >
                                                                <Heart size={10} className="inline -mt-0.5 mr-0.5" /> {matchScore}% Match
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                        {theirProfile?.department ? `${theirProfile.department}` : ''}{theirProfile?.department && theirProfile?.year ? ' · ' : ''}{theirProfile?.year || ''}{!theirProfile?.department && !theirProfile?.year ? 'Online now' : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.08, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleChat(u.uid)}
                                                        className="btn-ruby text-xs px-4 py-2 flex items-center gap-1.5"
                                                    >
                                                        <MessageSquare size={13} /> Chat
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setReportModal(u.uid)}
                                                        className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-pointer"
                                                        style={{ color: 'var(--text-soft)' }}
                                                        title="Report / Block"
                                                    >
                                                        <AlertTriangle size={14} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                            {/* Shared Interests */}
                                            {shared.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="flex flex-wrap gap-1.5 mt-3 pt-3"
                                                    style={{ borderTop: '1px solid var(--border)' }}
                                                >
                                                    <span className="text-[10px] font-medium mr-1" style={{ color: 'var(--text-soft)' }}>Shared:</span>
                                                    {shared.slice(0, 5).map(interest => (
                                                        <span
                                                            key={interest}
                                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                                            style={{ background: 'var(--accent-dim)', color: 'var(--accent-bright)', border: '1px solid rgba(255,59,92,0.1)' }}
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                                    {shared.length > 5 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
                                                            +{shared.length - 5} more
                                                        </span>
                                                    )}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Report / Block Modal */}
            <AnimatePresence>
                {reportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setReportModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card p-7 w-full max-w-md"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Report or Block User</h3>
                            <div className="space-y-4">
                                <textarea
                                    value={reportReason}
                                    onChange={e => setReportReason(e.target.value)}
                                    placeholder="Why are you reporting this user?"
                                    rows={3}
                                    className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-all resize-none"
                                    style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleReport}
                                        disabled={!reportReason.trim()}
                                        className="btn-ruby flex-1 text-sm disabled:opacity-40"
                                    >
                                        <Send size={13} className="inline -mt-0.5 mr-1" /> Submit Report
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => { handleBlock(reportModal); setReportModal(null); }}
                                        className="flex-1 text-sm py-2.5 rounded-xl font-semibold cursor-pointer"
                                        style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                                    >
                                        <ShieldBan size={13} className="inline -mt-0.5 mr-1" /> Block User
                                    </motion.button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => { setReportModal(null); setReportReason(''); }}
                                    className="w-full text-sm py-2 cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
