# AI Study Assistant - Backend

This is the Node.js and Express backend for the AI Study Assistant application. It uses Google Genkit with Gemini for AI functionalities and Firebase Admin for JWT verification.

## Setup and Running Locally

1.  **Install Dependencies:**
    ```sh
    npm install
    ```

2.  **Create `.env` file:**
    Copy the contents of `.env.example` into a new file named `.env`.

3.  **Add Environment Variables:**
    Fill in the `.env` file with your credentials:
    - `GOOGLE_API_KEY`: Your API key for Google Gemini.
    - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Your Firebase Admin service account credentials. You can generate a private key in your Firebase project settings under "Service accounts".

4.  **Run in Development Mode:**
    ```sh
    npm run dev
    ```
    The server will start, typically on `http://localhost:3001`.

5.  **Run for Production:**
    ```sh
    npm start
    ```

## Deployment on Render

1.  Create a new "Web Service" on Render and connect your Git repository.
2.  Set the **Build Command** to `npm install`.
3.  Set the **Start Command** to `npm start`.
4.  Under "Environment", add the environment variables from your `.env` file (`GOOGLE_API_KEY`, `FIREBASE_PROJECT_ID`, etc.).
5.  Deploy the service. Render will provide you with a public URL for your backend.
