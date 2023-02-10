import express from 'express';
import { getTest, signUp, signIn, signOut, getNewRefreshToken } from '../services/auth.service';

const router = express.Router();

router.get('/', getTest);

router.post('/sign-up', signUp);

router.post('/sign-in', signIn);

router.post('/sign-out', signOut);

router.post('/refresh-token', getNewRefreshToken);

export default router;