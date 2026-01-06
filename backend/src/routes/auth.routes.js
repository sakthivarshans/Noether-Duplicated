import { Router } from 'express';
import admin from '../firebase/firebaseAdmin.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

// This endpoint could be used by the frontend to confirm a user's token is valid
// and get their basic details after login/signup.
router.get('/me', verifyToken, async (req, res) => {
  const { uid, name, email } = req.user;

  try {
    // Optional: You could fetch additional user data from your own database here
    // For this project, we'll just return the info from the token.

    res.status(200).json({ uid, name, email });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
