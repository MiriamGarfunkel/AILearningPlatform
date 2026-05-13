import { Request, Response, NextFunction } from 'express';
import HttpError from '../shared/http-error';

export const global_error_handler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error('Route pipeline error:', err);

  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'הנתונים שהזנת  כבר קיימים במערכת',
    });
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: string }).name === 'ValidationError'
  ) {
    const e = err as { errors: Record<string, { message: string }> };
    const message = Object.values(e.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  const status = err instanceof HttpError ? err.statusCode : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : err instanceof Error
        ? err.message
        : 'שגיאת שרת פנימית';

  res.status(status >= 400 && status < 600 ? status : 500).json({
    success: false,
    message: message || 'שגיאת שרת פנימית',
  });
};
