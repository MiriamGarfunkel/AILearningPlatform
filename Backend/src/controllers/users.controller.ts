import { Request, Response, NextFunction } from 'express';
import * as registry from '../services/user-registry.service';
import User from '../models/User';
import HttpError from '../shared/http-error';
import { optional_trimmed_string, require_non_empty_string } from '../shared/input-sanitize';
import { mintBearerTokenForSubject } from '../services/auth-tokens.service';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = require_non_empty_string(req.body?.id, 'id');
    const name = require_non_empty_string(req.body?.name, 'name');
    const phone = require_non_empty_string(req.body?.phone, 'phone');
    const role = optional_trimmed_string(req.body?.role) as 'user' | 'admin' | undefined;

    const existingUser = await User.findById(id);
    if (existingUser) {
      return next(new HttpError('משתמש עם תעודת זהות זו כבר קיים במערכת', 400));
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new HttpError('מספר הטלפון הזה כבר רשום במערכת למשתמש אחר', 400));
    }

    const user = await registry.registerIdentityRecord({
      _id: id,
      name,
      phone,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = mintBearerTokenForSubject(String(user._id));

    res.status(201).json({
      success: true,
      message: 'המשתמש נרשם בהצלחה',
      token,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('נא לספק תעודת זהות, שם ומספר טלפון', 400));
    }
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = require_non_empty_string(req.body?.id, 'id');
    const phone = require_non_empty_string(req.body?.phone, 'phone');
    const name = require_non_empty_string(req.body?.name, 'name');

    const userExists = await User.findById(id);

    if (!userExists) {
      return next(new HttpError('אתה עוד לא רשום, נא להירשם קודם', 404));
    }

    const user = await User.findOne({ _id: id, phone, name });

    if (!user) {
      return next(new HttpError('פרטי התחברות שגויים (שם או טלפון לא תואמים)', 401));
    }

    const token = mintBearerTokenForSubject(String(user._id));

    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('נא לספק שם, תעודת זהות ומספר טלפון', 400));
    }
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await registry.locateIdentityByPrimaryKey(String(id));

    if (!user) {
      return next(new HttpError('משתמש לא נמצא', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
