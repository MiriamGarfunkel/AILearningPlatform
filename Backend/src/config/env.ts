export type AiRuntimeMode = 'auto' | 'remote' | 'offline';

export function readMongoConnectionString(): string {
  return process.env.MONGO_URI ?? 'mongodb://localhost:27017/ai_learning';
}

export function readHttpListenPort(): number {
  const raw = process.env.PORT;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 5000;
}

export function readJwtSigningMaterial(): { secret: string; expiresIn: string } {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be defined when NODE_ENV=production');
  }
  return {
    secret: secret ?? 'fallbackSecretKey',
    expiresIn: process.env.JWT_EXPIRE ?? '30d',
  };
}

export function readAiRuntimeMode(): AiRuntimeMode {
  const v = (process.env.AI_PROVIDER_MODE ?? 'auto').toLowerCase();
  if (v === 'remote' || v === 'offline' || v === 'auto') return v;
  return 'auto';
}

export function hasOpenAiCredential(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
