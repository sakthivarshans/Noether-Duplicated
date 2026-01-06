# AI Study Assistant - Frontend

This is the Next.js frontend for the AI Study Assistant application. It handles user authentication with the Firebase Client SDK and makes authenticated API calls to the backend.

## Setup and Running Locally

1.  **Install Dependencies:**
    ```sh
    npm install
    ```

2.  **Create `.env.local` file:**
    Copy the contents of `.env.local.example` into a new file named `.env.local`.

3.  **Add Environment Variables:**
    Fill in the `.env.local` file with your credentials:
    - `NEXT_PUBLIC_BACKEND_URL`: The URL of your running backend (e.g., `http://localhost:3001`).
    - `NEXT_PUBLIC_FIREBASE_*`: Your Firebase app's public configuration keys. You can find these in your Firebase project settings.

4.  **Run in Development Mode:**
    ```sh
    npm run dev
    ```
    The application will start on `http://localhost:3000`.

## Deployment on Vercel

1.  Create a new project on Vercel and connect your Git repository.
2.  Vercel should automatically detect it as a Next.js project and configure the build settings.
3.  Under the project's "Settings" -> "Environment Variables", add the environment variables from your `.env.local` file.
    - **IMPORTANT:** For `NEXT_PUBLIC_BACKEND_URL`, use the public URL provided by Render for your deployed backend.
4.  Deploy the project.
