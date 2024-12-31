import express from 'express';
import { prisma } from '../app.js';

const router = express.Router();

// Create project
router.post('/', async (req, res) => {
  const { name, description, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ error: 'Name and userId are required' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error creating project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await prisma.project.delete({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Error deleting project' });
  }
});

// List projects
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

export default router; 