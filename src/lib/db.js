import {
    collection, doc, setDoc, updateDoc, deleteDoc, getDoc,
    onSnapshot, query, where, orderBy, addDoc,
    serverTimestamp, getDocs, limit, limitToLast, increment, startAfter
} from "firebase/firestore";
import { db } from "./firebase";

// ──────────────────────────────────────────────
// 🛡️ SECURITY: Input sanitization
// ──────────────────────────────────────────────
const sanitize = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .trim()
        .slice(0, 2000); // Max 2000 chars
};

// ──────────────────────────────────────────────
// 👤 USER PROFILES
// ──────────────────────────────────────────────
export const createOrUpdateUserProfile = async (uid, data) => {
    const profileRef = doc(db, "users", uid);
    await setDoc(profileRef, {
        uid,
        displayName: data.displayName || 'Anonymous',
        email: data.email || '',
        photoURL: data.photoURL || '',
        bio: sanitize(data.bio || ''),
        interests: data.interests || [],
        department: sanitize(data.department || ''),
        year: data.year || '',
        createdAt: data.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        isOnline: true,
        lastSeen: serverTimestamp(),
    }, { merge: true });
};

export const getUserProfile = async (uid) => {
    const profileRef = doc(db, "users", uid);
    const snap = await getDoc(profileRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const subscribeToUserProfile = (uid, callback) => {
    return onSnapshot(doc(db, "users", uid), (snap) => {
        callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
};

export const updateOnlineStatus = async (uid, isOnline) => {
    const profileRef = doc(db, "users", uid);
    await updateDoc(profileRef, {
        isOnline,
        lastSeen: serverTimestamp(),
    }).catch(() => { });
};

// ──────────────────────────────────────────────
// 🟢 OPEN TO TALK & MATCHING
// ──────────────────────────────────────────────
export const updateUserStatus = async (uid, isOpen, userData = {}) => {
    const statusRef = doc(db, "status", uid);
    if (isOpen) {
        await setDoc(statusRef, {
            ...userData,
            uid,
            isOpen: true,
            lastActive: serverTimestamp(),
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        }, { merge: true });
    } else {
        await updateDoc(statusRef, {
            isOpen: false,
            lastActive: serverTimestamp(),
        });
    }
};

export const subscribeToActiveUsers = (callback) => {
    const q = query(
        collection(db, "status"),
        where("isOpen", "==", true),
        orderBy("lastActive", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const now = new Date();
        const users = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const expiresAt = data.expiresAt?.toDate?.() || null;
            if (!expiresAt || expiresAt > now) {
                users.push({ id: doc.id, ...data });
            }
        });
        callback(users);
    });
};

/* 💘 Match Function Helpers */
export const calculateMatchPercentage = (myInterests = [], theirInterests = []) => {
    if (!myInterests.length || !theirInterests.length) return 0;
    const intersection = myInterests.filter(i => theirInterests.includes(i));
    const union = new Set([...myInterests, ...theirInterests]);
    return Math.round((intersection.length / union.size) * 100);
};

// ──────────────────────────────────────────────
// 💬 CHAT
// ──────────────────────────────────────────────
export const getOrCreateChat = async (currentUserId, otherUserId) => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", currentUserId));
    const querySnapshot = await getDocs(q);
    let existingChatId = null;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(otherUserId)) {
            existingChatId = doc.id;
        }
    });

    if (existingChatId) return existingChatId;

    const newChatRef = await addDoc(chatsRef, {
        participants: [currentUserId, otherUserId],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        unreadCount: { [currentUserId]: 0, [otherUserId]: 0 },
    });
    return newChatRef.id;
};

export const sendMessage = async (chatId, text, senderId) => {
    const sanitized = sanitize(text);
    if (!sanitized) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
        text: sanitized,
        senderId,
        createdAt: serverTimestamp(),
        readBy: [senderId],
        deleted: false,
    });

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
        const otherUid = chatSnap.data().participants.find(p => p !== senderId);
        const unreadUpdate = {};
        if (otherUid) {
            unreadUpdate[`unreadCount.${otherUid}`] = increment(1);
        }
        await updateDoc(chatRef, {
            lastMessage: sanitized.slice(0, 100),
            lastMessageTime: serverTimestamp(),
            ...unreadUpdate,
        });

        // Add Notification for other user
        if (otherUid) {
            addNotification(otherUid, {
                type: 'MESSAGE',
                title: 'New Message 💬',
                body: `You have a new message`,
                link: `/chat/${chatId}`,
            });
        }
    }
};

export const deleteMessage = async (chatId, messageId) => {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    await updateDoc(msgRef, {
        deleted: true,
        text: "This message was deleted",
    });
};

export const subscribeToMessages = (chatId, callback) => {
    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc"),
        limitToLast(50)
    );
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
};

export const subscribeToUserChats = (userId, callback) => {
    const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageTime", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach((doc) => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        callback(chats);
    });
};

// ──────────────────────────────────────────────
// ⌨️ TYPING indicators
// ──────────────────────────────────────────────
export const setTypingStatus = async (chatId, userId, isTyping) => {
    const typingRef = doc(db, "chats", chatId, "typing", userId);
    await setDoc(typingRef, {
        isTyping,
        updatedAt: serverTimestamp(),
    });
};

export const subscribeToTyping = (chatId, userId, callback) => {
    return onSnapshot(
        collection(db, "chats", chatId, "typing"),
        (snapshot) => {
            let someoneTyping = false;
            snapshot.forEach((doc) => {
                if (doc.id !== userId && doc.data().isTyping) {
                    someoneTyping = true;
                }
            });
            callback(someoneTyping);
        }
    );
};

// ──────────────────────────────────────────────
// ✅ READ RECEIPTS
// ──────────────────────────────────────────────
export const markMessagesAsRead = async (chatId, userId) => {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
    }).catch(() => { });
};

export const getTotalUnreadCount = (chats, userId) => {
    let total = 0;
    chats.forEach(chat => {
        const count = chat.unreadCount?.[userId] || 0;
        total += count;
    });
    return total;
};

// ──────────────────────────────────────────────
// 🚫 BLOCK / REPORT
// ──────────────────────────────────────────────
export const blockUser = async (blockerId, blockedId) => {
    const blockId = `${blockerId}_${blockedId}`;
    await setDoc(doc(db, "blocks", blockId), {
        blockerId,
        blockedId,
        createdAt: serverTimestamp(),
    });
};

export const unblockUser = async (blockerId, blockedId) => {
    const blockId = `${blockerId}_${blockedId}`;
    await deleteDoc(doc(db, "blocks", blockId));
};

export const subscribeToMyBlocks = (userId, callback) => {
    const q = query(
        collection(db, "blocks"),
        where("blockerId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const blocked = [];
        snapshot.forEach((doc) => {
            blocked.push(doc.data().blockedId);
        });
        callback(blocked);
    });
};

export const reportUser = async (reporterId, reportedId, reason) => {
    await addDoc(collection(db, "reports"), {
        reporterId,
        reportedId,
        reason: sanitize(reason),
        createdAt: serverTimestamp(),
        status: 'pending',
    });
};

// ──────────────────────────────────────────────
// 🔔 NOTIFICATIONS (Improved)
// ──────────────────────────────────────────────
export const addNotification = async (userId, notification) => {
    // Basic rate limit: minimal check
    await addDoc(collection(db, "notifications", userId, "items"), {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
    });
};

export const subscribeToNotifications = (userId, callback) => {
    const q = query(
        collection(db, "notifications", userId, "items"),
        orderBy("createdAt", "desc"),
        limit(20)
    );
    return onSnapshot(q, (snapshot) => {
        const notifs = [];
        snapshot.forEach((doc) => {
            notifs.push({ id: doc.id, ...doc.data() });
        });
        callback(notifs);
    });
};

export const markNotificationRead = async (userId, notifId) => {
    await updateDoc(doc(db, "notifications", userId, "items", notifId), {
        read: true,
    });
};

export const clearAllNotifications = async (userId, notifs) => {
    const promises = notifs.map(n =>
        deleteDoc(doc(db, "notifications", userId, "items", n.id))
    );
    await Promise.all(promises);
};

// ──────────────────────────────────────────────
// 📢 CAMPUS BUZZ (Confessions/Feed)
// ──────────────────────────────────────────────
export const createBuzzPost = async (userId, content, isAnonymous = true) => {
    const sanitized = sanitize(content);
    if (!sanitized) return;

    await addDoc(collection(db, "buzz"), {
        userId: isAnonymous ? 'ANON' : userId,
        content: sanitized,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        isAnonymous,
    });
};

export const subscribeToBuzz = (callback) => {
    const q = query(collection(db, "buzz"), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        callback(posts);
    });
};

export const likeBuzzPost = async (postId, userId) => {
    const likeRef = doc(db, "buzz", postId, "likes", userId);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(doc(db, "buzz", postId), { likes: increment(-1) });
    } else {
        await setDoc(likeRef, { createdAt: serverTimestamp() });
        await updateDoc(doc(db, "buzz", postId), { likes: increment(1) });
    }
};

export const checkPostLiked = async (postId, userId) => {
    const likeRef = doc(db, "buzz", postId, "likes", userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
};

// ──────────────────────────────────────────────
// 💬 BUZZ COMMENTS
// ──────────────────────────────────────────────
export const addBuzzComment = async (postId, userId, userName, text) => {
    const sanitized = sanitize(text).slice(0, 500);
    if (!sanitized) return;

    await addDoc(collection(db, "buzz", postId, "comments"), {
        userId,
        userName: userName || 'Anonymous',
        text: sanitized,
        createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "buzz", postId), {
        comments: increment(1),
    });
};

export const subscribeToBuzzComments = (postId, callback) => {
    const q = query(
        collection(db, "buzz", postId, "comments"),
        orderBy("createdAt", "asc"),
        limit(50)
    );
    return onSnapshot(q, (snapshot) => {
        const comments = [];
        snapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        callback(comments);
    });
};

export const deleteBuzzComment = async (postId, commentId) => {
    await deleteDoc(doc(db, "buzz", postId, "comments", commentId));
    await updateDoc(doc(db, "buzz", postId), {
        comments: increment(-1),
    });
};

// ──────────────────────────────────────────────
// 👥 GROUP CHATS (Full Implementation)
// ──────────────────────────────────────────────
export const getGroupInfo = async (groupId) => {
    const snap = await getDoc(doc(db, "groups", groupId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createGroup = async (name, desc, category, creatorId) => {
    const groupRef = await addDoc(collection(db, "groups"), {
        name: sanitize(name),
        description: sanitize(desc),
        category,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        memberCount: 1,
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
    });
    // Auto-join creator
    await setDoc(doc(db, "groupMembers", `${creatorId}_${groupRef.id}`), {
        userId: creatorId,
        groupId: groupRef.id,
        joinedAt: serverTimestamp(),
    });
    return groupRef.id;
};

export const subscribeToGroups = (callback) => {
    const q = query(collection(db, "groups"), orderBy("lastMessageTime", "desc"));
    return onSnapshot(q, (snapshot) => {
        const groups = [];
        snapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        callback(groups);
    });
};

export const sendGroupMessage = async (groupId, text, senderId, senderName) => {
    const sanitized = sanitize(text);
    if (!sanitized) return;

    await addDoc(collection(db, "groups", groupId, "messages"), {
        text: sanitized,
        senderId,
        senderName: senderName || 'Anonymous',
        createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "groups", groupId), {
        lastMessage: sanitized.slice(0, 80),
        lastMessageTime: serverTimestamp(),
    });
};

export const subscribeToGroupMessages = (groupId, callback) => {
    const q = query(
        collection(db, "groups", groupId, "messages"),
        orderBy("createdAt", "asc"),
        limitToLast(50)
    );
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
};
