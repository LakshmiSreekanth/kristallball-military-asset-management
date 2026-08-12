import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'military_asset_secret_key_2024';

export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, baseId: user.base_id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export { JWT_SECRET };
