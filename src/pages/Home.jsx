import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Radio, Lock, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
    const { user, login, authError, clearError } = useAuth();
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    return (
        <div className="min-h-[85vh] flex flex-col">
            {/* Hero */}
            <div className="flex-1 flex items-center">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left — Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 cursor-default"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--accent)' }}
                        >
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <Shield size={12} />
                            Verified College Students Only
                        </motion.span>

                        <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.08] mb-7">
                            <motion.span
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="block text-white"
                            >
                                Find Your Connection
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="block mt-1"
                            >
                                On <span className="text-gradient-ruby font-display italic">Campus</span>
                            </motion.span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="text-base italic font-display mb-4"
                            style={{ color: 'var(--accent-bright)' }}
                        >
                            Connect. Crush. Campus.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="text-lg md:text-xl mb-10 max-w-md leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Friendships. Conversations. Crushes. All in one classy
                            space for your college community.
                        </motion.p>

                        {/* Auth Error */}
                        {authError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="mb-6 px-5 py-3 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                                <span className="flex-1">{authError}</span>
                                <button onClick={clearError} className="text-red-500 hover:text-red-300 font-bold cursor-pointer">×</button>
                            </motion.div>
                        )}

                        {/* CTA Group */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-wrap gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={login}
                                className="btn-primary flex items-center gap-2.5 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Get Started
                                <ArrowRight size={16} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-outline cursor-pointer"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Learn More
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Right — Floating Heart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:flex items-center justify-center"
                    >
                        <div className="relative w-[420px] h-[420px] flex items-center justify-center">
                            {/* Glow backdrop */}
                            <div className="absolute inset-[-60px] rounded-full opacity-30 animate-pulse-slow"
                                style={{ background: 'radial-gradient(circle, rgba(255,59,92,0.35) 0%, transparent 55%)' }} />
                            <div className="absolute inset-[-30px] rounded-full opacity-20 animate-glow"
                                style={{ background: 'radial-gradient(circle, rgba(255,59,92,0.3) 0%, transparent 50%)' }} />

                            {/* Decorative rings */}
                            <div className="absolute inset-[30px] rounded-full" style={{ border: '1px solid rgba(255,59,92,0.08)' }} />
                            <div className="absolute inset-[65px] rounded-full" style={{ border: '1px solid rgba(255,255,255,0.03)' }} />

                            {/* THE HEART — replaces all orbiting emoji */}
                            <div className="heart-container">
                                <svg
                                    width="280"
                                    height="280"
                                    viewBox="0 0 24 24"
                                    fill="url(#heartGrad)"
                                    style={{ filter: 'drop-shadow(0 0 40px rgba(255, 59, 92, 0.45)) drop-shadow(0 0 80px rgba(255, 59, 92, 0.15))' }}
                                >
                                    <defs>
                                        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ff6b81" />
                                            <stop offset="50%" stopColor="#ff3b5c" />
                                            <stop offset="100%" stopColor="#e6002e" />
                                        </linearGradient>
                                        <radialGradient id="heartShine" cx="35%" cy="30%" r="50%">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </radialGradient>
                                    </defs>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#heartShine)" />
                                </svg>
                            </div>

                            {/* Floating sparkle particles — much cleaner than orbiting emoji */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        width: 2 + (i % 3) * 2,
                                        height: 2 + (i % 3) * 2,
                                        backgroundColor: i % 2 === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                                        top: `${15 + Math.sin(i * 1.1) * 35 + 35}%`,
                                        left: `${15 + Math.cos(i * 1.1) * 35 + 35}%`,
                                        willChange: shouldReduceMotion ? 'auto' : 'transform',
                                    }}
                                    animate={shouldReduceMotion ? { opacity: 0.15 } : {
                                        y: [0, -15 - i * 3, 0],
                                        opacity: [0.15, 0.5, 0.15],
                                        scale: [0.5, 1.3, 0.5],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.4,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features */}
            <div id="features" className="mt-28 mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold block mb-3" style={{ color: 'rgba(255,59,92,0.5)' }}>
                        <Sparkles size={12} className="inline mr-1.5 -mt-0.5" />Features
                    </span>
                    <span className="text-3xl font-bold text-white">Everything you need, <span className="font-display italic text-gradient-ruby">beautifully crafted</span></span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant, private messaging with your campus connections. End-to-end private.', accent: '#3b82f6' },
                        { icon: Radio, title: 'Open to Talk', desc: "Signal availability and discover who's free to connect right now.", accent: '#22c55e' },
                        { icon: Lock, title: 'Anonymous Crush', desc: "Submit your crush secretly. Reveal only happens when it's mutual.", accent: 'var(--accent)' },
                    ].map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                whileHover={{ y: -8 }}
                                className="glass-card-hover p-7 group cursor-pointer"
                            >
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                                    style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}>
                                    <Icon size={20} style={{ color: f.accent }} />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-gradient-ruby transition-all duration-300">{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
