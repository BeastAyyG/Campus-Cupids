# Campus Cupids

Project setup for "Campus Cupids" hackathon project.

## Getting Started

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Firebase Setup**:
    -   Go to [Firebase Console](https://console.firebase.google.com/).
    -   Create a new project.
    -   Enable **Authentication** (Google Sign-in).
    -   Enable **Firestore Database**.
    -   Copy your config keys into `src/lib/firebase.js`.

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure
-   `src/components`: UI components.
-   `src/pages`: Main application pages.
-   `src/context`: React Context (Auth).
-   `src/lib`: Configuration files.
-   `active-users.json` (mock data if needed).

## Deploy
To deploy your app to Firebase Hosting:
```bash
npm run build
firebase deploy
```
