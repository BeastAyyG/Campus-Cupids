import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrUpdateUserProfile, subscribeToUserProfile } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, CheckCircle2, Loader2, X, Pencil,
    Wifi, GraduationCap, Building2, FileText, Calendar, Heart, Sparkles
} from 'lucide-react';

const INTEREST_OPTIONS = [
    '💻 Coding', '⚽ Sports', '🎵 Music', '📚 Study', '🎨 Art',
    '🎬 Movies', '📸 Photography', '🎮 Gaming', '✈️ Travel',
    '🍳 Cooking', '📖 Reading', '🧘 Fitness', '🎤 Singing',
    '💃 Dancing', '🔬 Science', '🌍 Social Work',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG', 'PhD'];

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        bio: '',
        department: '',
        year: '',
        interests: [],
    });

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToUserProfile(user.uid, (data) => {
            if (data) {
                setProfile(data);
                setForm({
                    bio: data.bio || '',
                    department: data.department || '',
                    year: data.year || '',
                    interests: data.interests || [],
                });
            }
        });
        return () => unsub();
    }, [user]);

    const toggleInterest = (interest) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : prev.interests.length < 6
                    ? [...prev.interests, interest]
                    : prev.interests,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await createOrUpdateUserProfile(user.uid, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                bio: form.bio,
                department: form.department,
                year: form.year,
                interests: form.interests,
            });
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
        }
        setSaving(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <User size={20} className="text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">My Profile</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Customize your campus identity</p>
            </motion.div>

            {/* Saved Toast */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 px-5 py-3 rounded-xl text-green-400 text-sm font-medium flex items-center gap-2"
                        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                    >
                        <CheckCircle2 size={15} className="inline -mt-0.5 mr-1" /> Profile saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 mb-8"
            >
                {/* Avatar + Name */}
                <div className="flex items-center gap-5 mb-8">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 overflow-hidden flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)', ringColor: 'var(--accent-dim)' }}
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user?.displayName?.charAt(0) || '?'
                        )}
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user?.displayName}</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        {profile?.department && (
                            <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                                {profile.department} {profile.year && `• ${profile.year}`}
                            </p>
                        )}
                    </div>
                </div>

                {editing ? (
                    /* Edit Mode */
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Bio */}
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                placeholder="Tell people about yourself..."
                                maxLength={200}
                                rows={3}
                                className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-all resize-none"
                                style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{form.bio.length}/200</p>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">Department</label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                placeholder="e.g. Computer Science"
                                className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-all"
                                style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Year */}
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">Year</label>
                            <div className="flex flex-wrap gap-2">
                                {YEAR_OPTIONS.map(y => (
                                    <motion.button
                                        key={y}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setForm(p => ({ ...p, year: y }))}
                                        className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
                                        style={form.year === y
                                            ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                                            : { background: 'rgba(18,12,16,0.6)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                                        }
                                    >
                                        {y}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">Interests <span className="text-xs" style={{ color: 'var(--text-soft)' }}>(max 6)</span></label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map(interest => {
                                    const selected = form.interests.includes(interest);
                                    return (
                                        <motion.button
                                            key={interest}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleInterest(interest)}
                                            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
                                            style={selected
                                                ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', boxShadow: '0 0 10px rgba(255,59,92,0.15)' }
                                                : { background: 'rgba(18,12,16,0.6)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                                            }
                                        >
                                            {interest}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex gap-3 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-ruby flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={14} /> Save Profile</>}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setEditing(false)}
                                className="btn-outline flex-1"
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    /* View Mode */
                    <div>
                        {/* Bio */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-soft)' }}>Bio</h3>
                            <p className="text-sm text-white leading-relaxed">
                                {profile?.bio || <span style={{ color: 'var(--text-muted)' }}>No bio yet. Click edit to add one!</span>}
                            </p>
                        </div>

                        {/* Interests */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-soft)' }}>Interests</h3>
                            {profile?.interests?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map(i => (
                                        <motion.span
                                            key={i}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className="px-3 py-1.5 rounded-full text-xs font-medium cursor-default"
                                            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(255,59,92,0.12)' }}
                                        >
                                            {i}
                                        </motion.span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No interests added yet</p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { icon: Wifi, label: 'Status', value: profile?.isOnline ? 'Online' : 'Offline', color: '#22c55e' },
                                { icon: GraduationCap, label: 'Year', value: profile?.year || '—', color: '#f59e0b' },
                                { icon: Building2, label: 'Dept', value: profile?.department || '—', color: '#3b82f6' },
                            ].map(s => {
                                const Icon = s.icon;
                                return (
                                    <motion.div key={s.label} whileHover={{ y: -3 }} className="text-center p-3 rounded-xl" style={{ background: 'rgba(18,12,16,0.6)', border: '1px solid var(--border)' }}>
                                        <Icon size={16} className="mx-auto mb-1 opacity-50" style={{ color: s.color }} />
                                        <p className="text-xs font-bold text-white mt-1">{s.value}</p>
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{s.label}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setEditing(true)}
                            className="btn-ruby w-full flex items-center justify-center gap-2"
                        >
                            <Pencil size={14} /> Edit Profile
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
