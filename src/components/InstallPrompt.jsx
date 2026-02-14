import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center"
                >
                    <div className="glass-card flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--accent)]/30 bg-black/80 backdrop-blur-xl shadow-2xl max-w-sm w-full">
                        <div className="bg-[var(--accent)]/20 p-2 rounded-lg">
                            <Download size={20} className="text-[var(--accent)]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">Install App</h4>
                            <p className="text-xs text-[var(--text-muted)]">Add to home screen for better experience</p>
                        </div>
                        <button
                            onClick={handleInstall}
                            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Install
                        </button>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
