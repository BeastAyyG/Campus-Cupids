import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createOrUpdateUserProfile, updateOnlineStatus } from "../lib/db";

// ──────────────────────────────────────────────
// 🔧 TEST MODE: Set to "srmap.edu.in" for production
// Set to null to allow ALL Google accounts for testing
// ──────────────────────────────────────────────
const ALLOWED_DOMAIN = "srmap.edu.in"; // 🔒 PRODUCTION: Only @srmap.edu.in accounts allowed

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const email = currentUser.email || "";
                if (!ALLOWED_DOMAIN || email.endsWith(`@${ALLOWED_DOMAIN}`)) {
                    setUser(currentUser);
                    setAuthError(null);
                    // ── Auto-create/update user profile on login ──
                    try {
                        await createOrUpdateUserProfile(currentUser.uid, {
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL,
                        });
                        await updateOnlineStatus(currentUser.uid, true);
                    } catch (err) {
                        console.warn("Profile sync warning:", err.message);
                    }
                } else {
                    signOut(auth);
                    setUser(null);
                    setAuthError(`Only @${ALLOWED_DOMAIN} accounts are allowed.`);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ── Track online/offline status ──
    useEffect(() => {
        if (!user) return;
        const handleBeforeUnload = () => {
            updateOnlineStatus(user.uid, false);
        };
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updateOnlineStatus(user.uid, false);
            } else {
                updateOnlineStatus(user.uid, true);
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user]);

    const loginHelper = async () => {
        setAuthError(null);
        const provider = new GoogleAuthProvider();
        if (ALLOWED_DOMAIN) {
            provider.setCustomParameters({ hd: ALLOWED_DOMAIN });
        }
        try {
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email || "";
            if (ALLOWED_DOMAIN && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
                await signOut(auth);
                setAuthError(`Only @${ALLOWED_DOMAIN} accounts are allowed.`);
            }
        } catch (error) {
            if (error.code !== "auth/popup-closed-by-user") {
                console.error("Auth error:", error.code, error.message);
                setAuthError(`Error: ${error.code} — ${error.message}`);
            }
        }
    };

    const logoutHelper = async () => {
        setAuthError(null);
        if (user) {
            try {
                await updateOnlineStatus(user.uid, false);
            } catch (e) { }
        }
        return signOut(auth);
    };

    const clearError = () => setAuthError(null);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #1a0a10, #0d0d0d)' }}>
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">💘</div>
                    <p style={{ color: 'var(--accent)' }} className="font-medium animate-pulse">Loading Campus Cupids...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login: loginHelper, logout: logoutHelper, authError, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
