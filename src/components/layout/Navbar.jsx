import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    if (!currentUser) return null;

    return (
        <nav className="glass-panel fixed bottom-0 left-0 right-0 p-4 rounded-t-2xl md:top-0 md:bottom-auto md:rounded-b-2xl md:rounded-t-none z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold font-serif text-gradient hidden md:block">
                    Campus Cupids
                </Link>

                <div className="flex justify-around w-full md:w-auto md:gap-8">
                    <NavLink to="/dashboard" icon={<Heart size={24} />} label="Match" active={location.pathname === '/dashboard'} />
                    <NavLink to="/open-to-talk" icon={<MessageCircle size={24} />} label="Talk" active={location.pathname === '/open-to-talk'} />
                    <NavLink to="/profile" icon={<User size={24} />} label="Profile" active={location.pathname === '/profile'} />
                    <button onClick={logout} className="p-2 text-primary hover:text-ruby transition-colors">
                        <LogOut size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ to, icon, label, active }) {
    return (
        <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-ruby' : 'text-secondary hover:text-primary'}`}>
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}
