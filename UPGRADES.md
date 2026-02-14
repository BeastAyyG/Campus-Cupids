# Cleanup and Upgrade Plan

## ✅ Completed Cleanup
1.  **Removed `legacy_prototype` folder**: Deleted old backup files to save space.
2.  **Cleaned `Dashboard.jsx`**: Removed the "Seed Demo Data" button and logic aimed at judges/devs. The app is now fully user-focused.
3.  **Deleted `demo-seeder.js`**: Removed the script used to generate fake data.

## 🧹 Recommended Data Cleanup (Firebase Console)
Since you are now "totally live", you should manually clean up test data in your Firebase Console:
1.  **Firestore**: Delete the `users`, `chats`, `crushes`, `buzz` collections if they contain junk test data.
2.  **Authentication**: Delete test user accounts in the Authentication tab.
    *   *Warning*: This will prevent old test users from logging in.

## 🚀 Recommended Upgrades

### 1. Performance & Experience
-   **Lazy Loading**: Split your code using `React.lazy()` for pages like `Chat`, `Profile`, and `Buzz`. This will make the initial load much faster.
-   **Image Optimization**: Use a service like Cloudinary or Firebase Extensions to resize user uploaded images automatically.
-   **PWA Enhanced**: Add a custom "Install App" button in the UI instead of relying on the browser default.

### 2. Security
-   **Content Security Policy (CSP)**: Add CSP headers in `firebase.json` to prevent XSS attacks.
-   **Rate Limiting**: Implement strict rate limiting (e.g., max 5 buzz posts per hour) using Firestore Rules or Cloud Functions to prevent spam.

### 3. Reliability
-   **Error Boundaries**: Wrap your app in a React Error Boundary to catch crashes and show a nice "Something went wrong" page instead of a white screen.
-   **Analytics**: Integrate **Firebase Analytics** and **Crashlytics** to track user behavior and bugs in real-time.

### 4. Code Quality
-   **Prettier & Husky**: Set up automatic code formatting on commit to keep the codebase clean.
-   **Unit Tests**: Add `vitest` to test critical logic like the "match" algorithm or date formatting.
