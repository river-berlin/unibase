import { Router } from 'express';
import { authenticateToken, isAdmin } from '../../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'pong' });
});

router.get('/auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'authenticated pong',
    user: req.user
  });
});

router.get('/admin', authenticateToken, isAdmin, (req, res) => {
  res.json({ 
    message: 'admin pong',
    user: req.user
  });
});

export default router; 