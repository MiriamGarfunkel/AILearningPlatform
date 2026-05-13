import jwt from 'jsonwebtoken';
import { readJwtSigningMaterial } from '../config/env';

export function mintBearerTokenForSubject(subjectId: string): string {
  const { secret, expiresIn } = readJwtSigningMaterial();
  return jwt.sign({ id: subjectId }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}
