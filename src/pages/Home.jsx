import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Home() {
    const { currentUser, login } = useAuth();

    if (currentUser) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
            <h1 className="text-5xl font-serif text-gradient mb-4">Campus Cupids</h1>
            <p className="text-secondary text-lg mb-8 max-w-md">
                Connect with students on your campus. Find your crush, make new friends, or just talk.
            </p>

            <button
                onClick={login}
                className="btn-primary text-xl px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
                Sign in with Google
            </button>

            <div className="mt-12 grid grid-cols-2 gap-4 text-secondary text-sm">
                <div className="glass-panel p-4 rounded-xl">
                    <span className="block text-2xl mb-1">💬</span>
                    Open to Talk
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <span className="block text-2xl mb-1">❤️</span>
                    Find a Match
                </div>
            </div>
        </div>
    );
}
