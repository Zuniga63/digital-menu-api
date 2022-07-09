import jwt from 'jsonwebtoken';

/**
 *
 * @param payload Information to save into token
 * @param duration Life of token in seconds by defaul is one day
 * @returns
 */
export default function createToken(
  payload: object,
  duration?: number
): string {
  const secretKey: string = process.env.JWT_SECRET_KEY || 'secretKey';
  const expiresIn: number = duration || 60 * 60 * 24;

  return jwt.sign(payload, secretKey, { expiresIn });
}
