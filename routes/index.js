import express from 'express';
import authRouter from './auth.route'

const router = express.Router();

// authRouter
router.use('/', authRouter);

export default router;