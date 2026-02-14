import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    subscribeToGroups, createGroup
} from '../lib/db';
import {
    collection, query, where, onSnapshot, setDoc, deleteDoc, doc, serverTimestamp, increment, updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, MessageSquare, Rocket, LogOut, Search } from 'lucide-react';

const GROUP_CATEGORIES = [
    { name: 'All', emoji: '🌟' },
    { name: 'Study', emoji: '📚' },
    { name: 'Sports', emoji: '⚽' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Anime', emoji: '🎌' },
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Coding', emoji: '💻' },
    { name: 'Social', emoji: '🎉' },
    { name: 'Other', emoji: '✨' },
];

export default function Friendship() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [myGroupIds, setMyGroupIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupCategory, setNewGroupCategory] = useState('Social');
    const [activeCategory, setActiveCategory] = useState('All');

    // Subscribe to all groups
    useEffect(() => {
        const unsub = subscribeToGroups((g) => {
            setGroups(g);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Subscribe to my memberships
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "groupMembers"),
            where("userId", "==", user.uid)
        );
        const unsub = onSnapshot(q, (snap) => {
            const ids = [];
            snap.forEach((doc) => ids.push(doc.data().groupId));
            setMyGroupIds(ids);
        });
        return () => unsub();
    }, [user]);

    const handleCreate = async () => {
        if (!newGroupName.trim()) return;
        try {
            await createGroup(newGroupName, newGroupDesc, newGroupCategory, user.uid);
            setNewGroupName('');
            setNewGroupDesc('');
            setShowCreate(false);
        } catch (err) {
            console.error('Create group error:', err);
        }
    };

    const handleJoin = async (groupId) => {
        const memberId = `${user.uid}_${groupId}`;
        await setDoc(doc(db, "groupMembers", memberId), {
            userId: user.uid,
            groupId,
            joinedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "groups", groupId), {
            memberCount: increment(1),
        }).catch(() => { });
    };

    const handleLeave = async (groupId) => {
        const memberId = `${user.uid}_${groupId}`;
        await deleteDoc(doc(db, "groupMembers", memberId));
        await updateDoc(doc(db, "groups", groupId), {
            memberCount: increment(-1),
        }).catch(() => { });
    };

    const isMember = (groupId) => myGroupIds.includes(groupId);

    const filteredGroups = activeCategory === 'All'
        ? groups
        : groups.filter(g => g.category === activeCategory);

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <Users size={20} className="text-pink-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Friendship Groups</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Join communities, chat in real-time</p>
            </motion.div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide px-1">
                {GROUP_CATEGORIES.map((cat) => (
                    <motion.button
                        key={cat.name}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat.name ? 'text-white' : ''
                            }`}
                        style={{
                            background: activeCategory === cat.name ? 'linear-gradient(135deg, var(--accent), #e6002e)' : 'var(--card-bg-solid)',
                            border: '1px solid ' + (activeCategory === cat.name ? 'transparent' : 'var(--border)'),
                            color: activeCategory === cat.name ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        <span>{cat.emoji}</span> {cat.name}
                    </motion.button>
                ))}
            </div>

            {/* Create Button */}
            <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCreate(!showCreate)}
                className="w-full glass-card p-4 flex items-center justify-center gap-2 mb-6 cursor-pointer text-sm font-semibold transition-all hover:bg-white/5"
                style={{ color: 'var(--accent)', borderStyle: 'dashed' }}
            >
                {showCreate ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create New Group</>}
            </motion.button>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 mb-6 overflow-hidden"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-pink-500" /> Create a Group
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)}
                                placeholder="Group name..."
                                maxLength={50}
                                className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none"
                                style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                            />
                            <textarea
                                value={newGroupDesc}
                                onChange={e => setNewGroupDesc(e.target.value)}
                                placeholder="Description (optional)..."
                                rows={2}
                                maxLength={200}
                                className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none resize-none"
                                style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                            />
                            <div className="flex flex-wrap gap-2">
                                {GROUP_CATEGORIES.filter(c => c.name !== 'All').map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setNewGroupCategory(cat.name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${newGroupCategory === cat.name ? 'text-white' : ''
                                            }`}
                                        style={{
                                            background: newGroupCategory === cat.name ? 'var(--accent)' : 'transparent',
                                            border: '1px solid ' + (newGroupCategory === cat.name ? 'var(--accent)' : 'var(--border)'),
                                            color: newGroupCategory === cat.name ? 'white' : 'var(--text-muted)',
                                        }}
                                    >
                                        {cat.emoji} {cat.name}
                                    </button>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreate}
                                disabled={!newGroupName.trim()}
                                className="btn-ruby w-full py-3 text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                <Rocket size={16} /> Create Group
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                    {filteredGroups.map((group, i) => {
                        const joined = isMember(group.id);
                        const catEmoji = GROUP_CATEGORIES.find(c => c.name === group.category)?.emoji || '✨';
                        return (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="glass-card-hover p-5 flex flex-col group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="text-3xl">{catEmoji}</motion.div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                        <Users size={10} /> {group.memberCount || 0}
                                    </span>
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1 group-hover:text-gradient-ruby transition-all">{group.name}</h4>
                                <p className="text-xs mb-1 flex-1" style={{ color: 'var(--text-muted)' }}>
                                    {group.description || 'No description'}
                                </p>
                                {group.lastMessage && (
                                    <p className="text-[10px] truncate mb-3" style={{ color: 'var(--text-soft)' }}>
                                        <MessageSquare size={10} className="inline mr-1 opacity-70" /> {group.lastMessage}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-auto">
                                    {joined ? (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate(`/group/${group.id}`)}
                                                className="btn-ruby flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
                                            >
                                                <MessageSquare size={12} /> Open Chat
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleLeave(group.id)}
                                                className="text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center gap-1"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                                            >
                                                <LogOut size={12} />
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleJoin(group.id)}
                                            className="w-full text-xs py-2.5 rounded-xl cursor-pointer font-semibold"
                                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(255,59,92,0.2)' }}
                                        >
                                            <Plus size={14} /> Join Group
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredGroups.length === 0 && !loading && (
                <div className="text-center py-12 opacity-60">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-white font-medium">No groups yet in this category</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create the first one!</p>
                </div>
            )}
        </div>
    );
}
