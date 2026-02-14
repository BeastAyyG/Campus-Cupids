import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserChats, getTotalUnreadCount, subscribeToNotifications } from '../../lib/db';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Megaphone, MessageCircle, Heart,
    Mail, Bell, User, LogOut, Menu, X, Flame
} from 'lucide-react';

const NAV_ICON_SIZE = 17;

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const unsubChat = subscribeToUserChats(user.uid, (chats) => {
            const total = getTotalUnreadCount(chats, user.uid);
            setUnreadCount(total);
        });

        const unsubNotif = subscribeToNotifications(user.uid, (notifs) => {
            const unread = notifs.filter(n => !n.read).length;
            setNotifCount(unread);
        });

        return () => { unsubChat(); unsubNotif(); };
    }, [user]);

    const navItems = user
        ? [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Groups', path: '/friendship', icon: Users },
            { name: 'Buzz', path: '/buzz', icon: Megaphone },
            { name: 'Connect', path: '/open-to-talk', icon: MessageCircle },
            { name: 'Crush', path: '/crush', icon: Heart },
            { name: 'Inbox', path: '/chat', icon: Mail, badge: unreadCount },
            { name: 'Activity', path: '/notifications', icon: Bell, badge: notifCount },
            { name: 'Profile', path: '/profile', icon: User },
        ]
        : [];

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)', boxShadow: '0 4px 15px rgba(255,59,92,0.3)' }}
                        >
                            <Flame className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="hidden sm:inline text-lg font-bold italic text-gradient-ruby tracking-tight group-hover:tracking-normal transition-all duration-300">
                            Campus Cupids
                        </span>
                        <span className="sm:hidden text-lg font-bold text-gradient-ruby">CC</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden xl:flex items-center gap-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={clsx(
                                        "relative flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-300 nav-link-hover z-10",
                                        active
                                            ? "text-[var(--accent)]"
                                            : "text-[var(--text-muted)] hover:text-white"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-lg -z-10"
                                            style={{ background: 'var(--accent-dim)' }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon
                                        size={NAV_ICON_SIZE}
                                        className={clsx("transition-transform duration-300 relative z-20", active && "scale-110")}
                                        style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                                    />
                                    <span className="relative z-20">{item.name}</span>
                                    {item.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1 z-30"
                                            style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}
                                        >
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </motion.span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Mobile Notifications Bell */}
                                <Link to="/notifications" className="xl:hidden relative p-2 text-gray-400 hover:text-white transition-colors">
                                    <Bell size={18} />
                                    {notifCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-black" />
                                    )}
                                </Link>

                                {/* Desktop User Menu */}
                                <div className="hidden sm:flex items-center gap-2.5 relative">
                                    <Link to="/profile" className="flex items-center gap-2.5 cursor-pointer group">
                                        <motion.div
                                            whileHover={{ scale: 1.08 }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 transition-all duration-300 overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, var(--accent), #e6002e)', ringColor: 'var(--border)' }}
                                        >
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                user.displayName?.charAt(0) || 'U'
                                            )}
                                        </motion.div>
                                        <span className="text-sm font-medium max-w-[80px] truncate group-hover:text-white transition-colors duration-300"
                                            style={{ color: 'var(--text-muted)' }}>
                                            {user.displayName?.split(' ')[0]}
                                        </span>
                                    </Link>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={logout}
                                        className="hidden xl:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer"
                                        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <LogOut size={13} />
                                        Sign Out
                                    </motion.button>
                                </div>
                            </div>
                        ) : null}

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="xl:hidden p-2 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-white/5 relative"
                            aria-label="Toggle menu"
                        >
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-black" />
                            )}
                            {mobileOpen ? <X size={22} style={{ color: 'var(--text-muted)' }} /> : <Menu size={22} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden overflow-hidden"
                        style={{ background: 'rgba(13,10,16,0.95)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}
                    >
                        <div className="px-4 py-3 space-y-1">
                            {user && (
                                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/5 px-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                        {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : null}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{user.displayName}</p>
                                        <button onClick={logout} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer">
                                            <LogOut size={11} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                                            isActive(item.path)
                                                ? "text-[var(--accent)] bg-white/5"
                                                : "text-[var(--text-muted)] hover:text-white hover:translate-x-1"
                                        )}
                                    >
                                        <Icon size={18} className="w-5" />
                                        {item.name}
                                        {item.badge > 0 && (
                                            <span className="ml-auto min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5"
                                                style={{ background: 'var(--accent)' }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
