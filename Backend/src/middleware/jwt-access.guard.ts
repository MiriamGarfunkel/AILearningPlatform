import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import HttpError from '../shared/http-error';
import { readJwtSigningMaterial } from '../config/env';

export const require_bearer_user = async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new HttpError('Please sign in.', 401));
  }

  try {
    const { secret } = readJwtSigningMaterial();
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new HttpError('User not found.', 401));
    }

    (req as Request & { user?: typeof user }).user = user;
    next();
  } catch {
    return next(new HttpError('Invalid or expired token.', 401));
  }
};

export const restrict_to_roles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authed = req as Request & { user?: { role: string } };
    if (!authed.user || !roles.includes(authed.user.role)) {
      return next(new HttpError('Access denied.', 403));
    }
    next();
  };
};
