import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'No token provided',
    });
    return;
  }

  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'JWT configuration error',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Please login again',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: 'Invalid token',
        error: 'Token verification failed',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: 'Internal server error',
    });
  }
};
