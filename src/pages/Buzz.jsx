import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToBuzz, createBuzzPost, likeBuzzPost, checkPostLiked,
    addBuzzComment, subscribeToBuzzComments, deleteBuzzComment
} from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, MessageSquare, Heart, Send, Plus, X, Lock,
    User, AlertTriangle, ThumbsUp, MoreHorizontal, Trash2
} from 'lucide-react';

function CommentSection({ postId, user }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const unsub = subscribeToBuzzComments(postId, setComments);
        return () => unsub();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;
        setSending(true);
        const text = newComment;
        setNewComment('');

        try {
            await addBuzzComment(postId, user.uid, user.displayName, text);
        } catch (err) {
            console.error('Comment error:', err);
            setNewComment(text);
        }
        setSending(false);
    };

    const handleDelete = async (commentId) => {
        try {
            await deleteBuzzComment(postId, commentId);
        } catch (err) {
            console.error('Delete comment error:', err);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
        >
            <div className="pt-3 space-y-2.5">
                {/* Comments list */}
                {comments.length > 0 && (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-2.5 items-start group/comment"
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5"
                                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                                >
                                    {(comment.userName || 'A')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[11px] font-bold text-white truncate">
                                            {comment.userName || 'Anonymous'}
                                        </span>
                                        <span className="text-[9px] shrink-0" style={{ color: 'var(--text-soft)' }}>
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed break-words" style={{ color: 'var(--text-muted)' }}>
                                        {comment.text}
                                    </p>
                                </div>
                                {comment.userId === user.uid && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="opacity-0 group-hover/comment:opacity-100 text-[10px] transition-opacity shrink-0 mt-1 cursor-pointer"
                                        style={{ color: 'var(--text-soft)' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {comments.length === 0 && (
                    <p className="text-[11px] text-center py-2 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-soft)' }}>
                        <MessageSquare size={12} /> No comments yet. Be the first!
                    </p>
                )}

                {/* Comment input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={500}
                        className="flex-1 text-xs py-2 px-3 rounded-lg text-white placeholder-gray-600 focus:outline-none transition-colors"
                        style={{
                            background: 'rgba(18,12,16,0.8)',
                            border: '1px solid var(--border)',
                        }}
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="submit"
                        disabled={!newComment.trim() || sending}
                        className="text-xs px-3 py-2 rounded-lg font-semibold disabled:opacity-40 transition-opacity cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent), #e6002e)',
                            color: 'white',
                        }}
                    >
                        {sending ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send size={14} />}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
}

export default function Buzz() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [showCompose, setShowCompose] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [expandedComments, setExpandedComments] = useState(new Set());

    useEffect(() => {
        const unsub = subscribeToBuzz((buzzData) => {
            setPosts(buzzData);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Load initial liked state from Firestore
    useEffect(() => {
        if (!user || posts.length === 0) return;
        let cancelled = false;

        const loadLikes = async () => {
            const liked = new Set();
            const checks = posts.map(async (post) => {
                const isLiked = await checkPostLiked(post.id, user.uid);
                if (isLiked) liked.add(post.id);
            });
            await Promise.all(checks);
            if (!cancelled) setLikedPosts(liked);
        };

        loadLikes();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, posts.length]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setLoading(true);
        try {
            await createBuzzPost(user.uid, newPostContent, isAnonymous);
            setNewPostContent('');
            setShowCompose(false);
        } catch (err) {
            console.error('Buzz post error:', err);
        }
        setLoading(false);
    };

    const handleLike = async (postId) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });

        try {
            await likeBuzzPost(postId, user.uid);
        } catch (err) {
            console.error('Like error:', err);
            // Revert on error
            setLikedPosts(prev => {
                const next = new Set(prev);
                if (next.has(postId)) next.delete(postId);
                else next.add(postId);
                return next;
            });
        }
    };

    const toggleComments = (postId) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 pt-4">
                <div className="inline-flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}>
                        <Megaphone size={20} className="text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gradient-ruby">Campus Buzz</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Anonymous confessions, news & gossip</p>
            </motion.div>

            {/* Compose Button (Floating) */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCompose(!showCompose)}
                className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)', boxShadow: '0 4px 20px rgba(255,59,92,0.5)' }}
            >
                {showCompose ? <X size={24} /> : <Plus size={24} />}
            </motion.button>

            {/* Compose Modal / Area */}
            <AnimatePresence>
                {showCompose && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-card p-5 mb-8"
                    >
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Megaphone size={18} className="text-pink-500" /> New Buzz
                        </h3>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="What's buzzing? (Confessions, news, shoutouts...)"
                            maxLength={280}
                            rows={4}
                            className="w-full rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:outline-none transition-all resize-none mb-3"
                            style={{ background: 'rgba(18,12,16,0.8)', border: '1px solid var(--border)' }}
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--text-muted)' }}>
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="accent-pink-500 w-4 h-4"
                                />
                                Post Anonymously <Lock size={12} className="ml-1 opacity-70" />
                            </label>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim()}
                                className="btn-ruby px-6 py-2 text-sm disabled:opacity-50"
                            >
                                <Send size={15} /> Post
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feed */}
            <div className="space-y-4">
                {posts.map((post, i) => {
                    const liked = likedPosts.has(post.id);
                    const commentsOpen = expandedComments.has(post.id);
                    return (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -2 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                                        style={{ background: post.userId === 'ANON' ? 'rgba(255,255,255,0.05)' : 'var(--accent-dim)' }}>
                                        {post.userId === 'ANON' ? <Lock size={14} className="text-gray-400" /> : <User size={14} className="text-pink-400" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-white flex items-center gap-1.5">
                                            {post.userId === 'ANON' ? 'Anonymous Bee' : 'Campus User'}
                                            {post.userId === 'ANON' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-normal">Hidden</span>}
                                        </p>
                                        <p className="text-[10px]" style={{ color: 'var(--text-soft)' }}>
                                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-white text-sm leading-relaxed mb-4 whitespace-pre-wrap pl-12 -mt-2">
                                {post.content}
                            </p>
                            <div className="flex items-center gap-4 border-t pt-3 pl-12" style={{ borderColor: 'var(--border)' }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                                    style={{ color: liked ? '#ef4444' : 'var(--text-muted)' }}
                                >
                                    <Heart size={16} fill={liked ? '#ef4444' : 'none'} />
                                    {post.likes || 0}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleComments(post.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                                    style={{ color: commentsOpen ? 'var(--accent)' : 'var(--text-muted)' }}
                                >
                                    <MessageSquare size={16} /> {post.comments || 0}
                                </motion.button>
                                <button className="ml-auto text-xs opacity-30 hover:opacity-100 transition-opacity" title="Report">
                                    <AlertTriangle size={14} />
                                </button>
                            </div>

                            {/* Comments section */}
                            <AnimatePresence>
                                {commentsOpen && (
                                    <CommentSection postId={post.id} user={user} />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
                {posts.length === 0 && !loading && (
                    <div className="text-center py-10 opacity-60">
                        <Megaphone size={40} className="mx-auto mb-4 opacity-20" />
                        <p>No buzz yet. Be the first to confess!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
