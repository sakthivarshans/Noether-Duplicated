import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import 'dotenv/config';

// Ensure the Google API Key is available
if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is not defined in the environment variables.");
    process.exit(1);
}

export const ai = genkit({
    plugins: [
        googleAI({ apiKey: process.env.GOOGLE_API_KEY }),
    ],
    // Log to the console (useful for local development).
    logLevel: 'debug',
    // Prevent Genkit from writing telemetry data to disk.
    enableTelemetry: false,
});
