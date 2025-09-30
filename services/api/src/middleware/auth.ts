import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type JwtUser = { sub: string; role: 'customer' | 'vendor' | 'admin'; vendorId?: string };

export function requireAuth(req: Request & { user?: JwtUser }, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing Authorization header' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    req.user = { sub: decoded.sub, role: decoded.role, vendorId: decoded.vendorId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: Array<JwtUser['role']>) {
  return (req: Request & { user?: JwtUser }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
