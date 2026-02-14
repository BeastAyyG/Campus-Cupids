import { useState } from 'react';

export default function OpenToTalk() {
    const [isAvailable, setIsAvailable] = useState(false);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-serif text-gradient mb-2">Open to Talk</h1>
                <p className="text-secondary">Enable your status and connect with available students.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl text-center mb-8 border-2 border-pink-100">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-lg font-medium text-primary">
                        I&apos;m available to chat
                    </span>
                    <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${isAvailable ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`} />
                    </button>
                </div>

                <p className="text-secondary text-sm bg-pink-50 inline-block px-4 py-2 rounded-lg">
                    {isAvailable ? '✅ You are visible to other students!' : 'You are currently hidden.'}
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-serif text-primary mb-4">Available Now (0)</h2>
                <div className="text-center py-12 text-secondary opacity-60">
                    <div className="text-6xl mb-4">💤</div>
                    <p>No one is available right now. Be the first!</p>
                </div>
            </div>
        </div>
    );
}
