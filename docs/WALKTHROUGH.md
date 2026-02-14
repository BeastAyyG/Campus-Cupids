# Heartlink - Campus Cupids Walkthrough

## 🚀 Deployed Application
**URL:** [https://campus-cupids-135da.web.app](https://campus-cupids-135da.web.app)

## ✨ Features Implemented
1.  **Authentication**: Google Sign-In with Domain Lock (`@srmap.edu.in` only).
2.  **Home Page**: Landing page with "Ruby Glassmorphism" aesthetic.
3.  **Dashboard**: Real-time stats, feature navigation, and "Seed Demo" tool.
4.  **Groups**: Interest-based group chats with real-time messaging.
5.  **Campus Buzz**: Anonymous confessions feed with likes.
6.  **Notifications**: Real-time activity center.
7.  **PWA**: Installable on mobile devices.
8.  **Demo Mode**: Hidden tool on Dashboard to populate app with mock data for presentations.

## 🛠️ How to Run Locally
1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Open in Browser**:
    Usually `http://localhost:5173`

## 📦 Deployment
To deploy updates to the live site:
```bash
npm run build
firebase deploy
```

## 📂 Project Structure
-   `src/lib/firebase.js`: Firebase configuration.
-   `src/lib/db.js`: Firestore logic (users, chats, groups, buzz).
-   `src/lib/demo-seeder.js`: Mock data generator.
-   `src/context/AuthContext.jsx`: User session management + domain lock.
-   `src/components/layout/`: Navbar, Layout.
-   `src/pages/`: All application pages (Dashboard, Chat, Groups, etc.).
