import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Users from '../database/models/users';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /* 
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    /* 
    #swagger.responses[401] = {
      description: 'Unauthorized - No token provided',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      /* 
      #swagger.responses[500] = {
        description: 'Server error - JWT_SECRET not configured',
        schema: { $ref: '#/components/schemas/Error' }
      }
      */
      res.status(500).json({ error: 'JWT_SECRET is not configured' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
      email: string;
      name: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    /* 
    #swagger.responses[401] = {
      description: 'Unauthorized - Invalid token',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  /* 
  #swagger.security = [{
    "bearerAuth": []
  }]
  */
  if (!req.user) {
    /* 
    #swagger.responses[401] = {
      description: 'Unauthorized - Authentication required',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const db = req.app.locals.db;
  const user = await Users.findById(req.user.userId, db);

  if (!user || !user.is_admin) {
    /* 
    #swagger.responses[403] = {
      description: 'Forbidden - Admin access required',
      schema: { $ref: '#/components/schemas/Error' }
    }
    */
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}; 