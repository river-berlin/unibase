import express from 'express';
import { prisma } from '../app.js';

const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await prisma.user.delete({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Error deleting user' });
  }
});

export default router; 