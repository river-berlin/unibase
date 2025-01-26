import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  headers: Request['headers'] & {
    authorization?: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if(process.env.JWT_SECRET === undefined) {
      throw new Error('JWT_SECRET is not set');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    
    // Get fresh user data from database
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'is_admin'])
      .where('id', '=', decoded.userId)
      .executeTakeFirst();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Error processing authentication' });
  }
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}; 