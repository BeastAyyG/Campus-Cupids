# Implementation Plan: Post-Deployment Upgrades

## Goal
Enhance the "Campus Cupids" application's performance, security, and reliability by implementing the recommendations from `UPGRADES.md` after the initial live deployment.

---

## Phase 1: Performance & PWA (Frontend Specialist)
**Objective:** Improve initial load speed and mobile experience through code splitting and optimization.

### 1.1 Route-based Lazy Loading
-   **Files**: `src/App.jsx`
-   **Action**: Replace static imports for `Chat`, `Profile`, and `Buzz` pages with `React.lazy()`. Wrap the `Routes` in a `Suspense` component with a loading spinner fallback.

### 1.2 Image Compression on Upload
-   **Files**: `src/components/ImageUpload.jsx` (create if needed, or modify existing upload logic)
-   **Action**: Integrate `browser-image-compression` to resize user-uploaded photos client-side before they are sent to Firebase Storage.

### 1.3 Custom PWA Installation UI
-   **Files**: `src/components/InstallPrompt.jsx`, `src/App.jsx`
-   **Action**: Implement a listener for the `beforeinstallprompt` event and provide a custom installation button in the UI (e.g., in the settings or a toast).

---

## Phase 2: Security & Reliability (Backend Specialist / Security Auditor)
**Objective:** Harden the application against attacks and ensure a stable user experience.

### 2.1 Enforce Content Security Policy (CSP)
-   **Files**: `firebase.json`
-   **Action**: Add a `headers` section under `hosting` to include a `Content-Security-Policy`. Restrict `script-src` and `style-src` to 'self' and trusted Firebase/Google domains.

### 2.2 Rate Limiting via Firestore Rules
-   **Files**: `firestore.rules`
-   **Action**: Add a rule for the `buzz` collection that checks if the request timestamp is at least 5 minutes newer than the user's previous post to prevent spam. (Or implemented via a cloud function if rules are too complex for this).

### 2.3 Global Error Boundaries
-   **Files**: `src/components/ErrorBoundary.jsx`, `src/main.jsx`
-   **Action**: Create a React Error Boundary component and wrap the main `<App />` component to prevent full-page crashes.

### 2.4 Firebase Analytics & Crashlytics
-   **Files**: `src/lib/firebase.js`
-   **Action**: Initialize `getAnalytics` to monitor real-time user engagement.

---

## Phase 3: Code Quality & Testing (DevOps / Test Engineer)
**Objective:** Standardize development workflow and prevent regressions.

### 3.1 Commit Hooks with Husky & Prettier
-   **Files**: `package.json`, `.prettierrc`
-   **Action**: Set up `husky` and `lint-staged` to run `prettier --write` on staged files during every commit.

### 3.2 Critical Logic Unit Tests
-   **Files**: `src/utils/matchAlgorithm.js`, `src/utils/matchAlgorithm.test.js`
-   **Action**: Install `vitest` and write a test suite for the matching algorithm (or similar core logic) to ensure users are paired correctly.

---

## Verification
To ensure the upgrades are successful, run the following commands:

-   **Build Check**: `npm run build` (Verify that separate JS chunks are created).
-   **Logic Check**: `npm test` (Execute Vitest suites).
-   **Security Check**: Verify CSP headers by checking the network tab in browser DevTools after deployment.
