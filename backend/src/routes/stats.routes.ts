import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';

const router = Router();
router.get('/dashboard', getDashboardStats);

export default router;
