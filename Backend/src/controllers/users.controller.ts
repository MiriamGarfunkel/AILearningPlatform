import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as registry from '../services/user-registry.service';
import User from '../models/User';
import HttpError from '../shared/http-error';
import { optional_trimmed_string, require_non_empty_string } from '../shared/input-sanitize';
import { createToken } from '../services/auth-tokens.service';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = require_non_empty_string(req.body?.id, 'id');
    const name = require_non_empty_string(req.body?.name, 'name');
    const phone = require_non_empty_string(req.body?.phone, 'phone');
    const existingUser = await User.findById(id);
    if (existingUser) {
      return next(new HttpError('A user with this ID already exists.', 400));
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new HttpError('This phone number is already registered to another user.', 400));
    }

    const user = await registry.createUser({
      _id: id,
      name,
      phone,
      role: 'user',
    });

    const token = createToken(String(user._id));

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('Please provide ID, full name, and phone number.', 400));
    }
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = optional_trimmed_string(req.body?.email)?.toLowerCase();
    const password = optional_trimmed_string(req.body?.password);

    if (email || password) {
      if (!email || !password) {
        return next(new HttpError('Email and password are both required for email sign-in.', 400));
      }

      const user = await User.findOne({ email }).select('+password_hash');
      if (!user?.password_hash) {
        return next(new HttpError('Invalid email or password.', 401));
      }

      const passwordOk = await bcrypt.compare(password, user.password_hash);
      if (!passwordOk) {
        return next(new HttpError('Invalid email or password.', 401));
      }

      const token = createToken(String(user._id));
      res.status(200).json({ success: true, token, data: user.toJSON() });
      return;
    }

    const id = require_non_empty_string(req.body?.id, 'id');
    const phone = require_non_empty_string(req.body?.phone, 'phone');
    const name = require_non_empty_string(req.body?.name, 'name');

    const userExists = await User.findById(id);

    if (!userExists) {
      return next(new HttpError('No account found for this ID. Please register first.', 404));
    }

    const user = await User.findOne({ _id: id, phone, name });

    if (!user) {
      return next(new HttpError('Sign-in failed: name or phone does not match this ID.', 401));
    }

    const token = createToken(String(user._id));

    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    if (error instanceof Error && error.message.includes('is required')) {
      return next(new HttpError('Please provide full name, ID number, and phone.', 400));
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
    const user = await registry.findUserById(String(id));

    if (!user) {
      return next(new HttpError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
