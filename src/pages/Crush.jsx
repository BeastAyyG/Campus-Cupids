import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection, doc, setDoc, getDocs, query, where, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
    Heart, Eye, HeartHandshake, Search, Send, Loader2,
    CheckCircle2, XCircle, Sparkles
} from 'lucide-react';

export default function Crush() {
    const { user } = useAuth();
    const [regNumber, setRegNumber] = useState('');
    const [status, setStatus] = useState(null);
    const [admirerCount, setAdmirerCount] = useState(0);
    const [matches, setMatches] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'crushes'), where('targetEmail', '==', user.email));
        const unsub = onSnapshot(q, (snap) => setAdmirerCount(snap.size));
        return () => unsub();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        checkMatches();
    }, [user]);

    const checkMatches = async () => {
        try {
            const myQ = query(collection(db, 'crushes'), where('senderEmail', '==', user.email));
            const mySnap = await getDocs(myQ);
            const myTargets = mySnap.docs.map(d => d.data().targetReg);
            const mutualMatches = [];
            for (const target of myTargets) {
                const reverseQ = query(collection(db, 'crushes'), where('targetEmail', '==', user.email), where('senderReg', '==', target));
                const reverseSnap = await getDocs(reverseQ);
                if (!reverseSnap.empty) mutualMatches.push(target);
            }
            setMatches(mutualMatches);
        } catch (err) {
            console.error('Match check error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!regNumber.trim() || submitting) return;
        setSubmitting(true);
        setStatus(null);
        try {
            const crushId = `${user.email}_${regNumber.trim().toUpperCase()}`;
            const targetEmail = `${regNumber.trim().toLowerCase()}@srmap.edu.in`;
            await setDoc(doc(db, 'crushes', crushId), {
                senderUid: user.uid,
                senderEmail: user.email,
                senderReg: user.email.split('@')[0].toUpperCase(),
                targetReg: regNumber.trim().toUpperCase(),
                targetEmail,
                createdAt: serverTimestamp(),
            });
            setStatus('success');
            setRegNumber('');
            checkMatches();
        } catch (err) {
            console.error('Crush error:', err);
            setStatus('error');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <Heart size={20} className="text-pink-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Anonymous Crush</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>100% anonymous. Reveals only when mutual.</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 gap-4 mb-8">
                <motion.div whileHover={{ y: -4 }} className="glass-card p-5 text-center cursor-default">
                    <Eye size={20} className="mx-auto mb-2 opacity-50" style={{ color: 'var(--accent)' }} />
                    <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{admirerCount}</p>
                    <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>Secret Admirers</p>
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className="glass-card p-5 text-center cursor-default">
                    <HeartHandshake size={20} className="mx-auto mb-2 opacity-50 text-green-400" />
                    <p className="text-3xl font-bold text-green-400">{matches.length}</p>
                    <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>Mutual Matches</p>
                </motion.div>
            </motion.div>

            {/* Submit Crush Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-8 mb-8">
                <h2 className="text-lg font-bold text-white mb-1">Submit a Crush</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Enter their registration number. They'll never know — unless it's mutual.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-70" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            placeholder="e.g. AP22110010001"
                            className="w-full rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none transition-all duration-300 placeholder-gray-600"
                            style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim), 0 0 15px rgba(255,59,92,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={submitting || !regNumber.trim()}
                        className="btn-ruby w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {submitting ? (
                            <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                        ) : (
                            <><Send size={15} /> Send Crush Anonymously</>
                        )}
                    </motion.button>
                </form>

                {/* Status Messages */}
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-5 flex items-center gap-2 text-green-400 text-sm px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
                        >
                            <CheckCircle2 size={16} /> Crush submitted! If it's mutual, you'll both be notified.
                        </motion.div>
                    )}
                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-5 flex items-center gap-2 text-red-400 text-sm px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                        >
                            <XCircle size={16} /> Something went wrong. Please try again.
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Mutual Matches */}
            <AnimatePresence>
                {matches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-7"
                        style={{ borderColor: 'rgba(34,197,94,0.15)' }}
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-green-400" /> Mutual Matches!
                        </h3>
                        <div className="space-y-2">
                            {matches.map((match) => (
                                <motion.div
                                    key={match}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-default"
                                    style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}
                                >
                                    <HeartHandshake size={18} className="text-green-400" />
                                    <span className="text-white font-medium text-sm">{match}</span>
                                    <span className="ml-auto text-xs text-green-400 font-medium">It's Mutual!</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
