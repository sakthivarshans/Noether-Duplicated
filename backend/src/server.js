import express from 'express';
import 'dotenv/config';
import cors from 'cors';

// Import middleware and routes
import verifyToken from './middleware/verifyToken.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Initialize Firebase Admin SDK (must be done before using it)
import './firebase/firebaseAdmin.js';

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// Public routes (don't require authentication)
app.get('/', (req, res) => {
  res.send('AI Study Assistant Backend is running!');
});

// Auth-related routes (for user validation)
app.use('/api/auth', authRoutes);

// Protected AI routes
// The verifyToken middleware will protect all routes defined in aiRoutes
app.use('/api/ai', verifyToken, aiRoutes);

// Get port from environment variables, with a fallback to 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
