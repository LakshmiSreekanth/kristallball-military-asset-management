import bcrypt from 'bcryptjs';
import { queryOne, queryAll } from '../config/db.js';
import { generateToken } from '../config/jwt.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required.' });
    }

    const user = queryOne(
      `SELECT u.*, b.name as base_name FROM users u
       LEFT JOIN bases b ON u.base_id = b.id
       WHERE u.username = ?`,
      [username]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.base_id,
        baseName: user.base_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export function getProfile(req, res) {
  const user = queryOne(
    `SELECT u.id, u.username, u.role, u.base_id, b.name as base_name
     FROM users u LEFT JOIN bases b ON u.base_id = b.id
     WHERE u.id = ?`,
    [req.user.id]
  );
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    baseId: user.base_id,
    baseName: user.base_name
  });
}

export function getUsers(req, res) {
  const users = queryAll(
    `SELECT u.id, u.username, u.role, u.base_id, b.name as base_name
     FROM users u LEFT JOIN bases b ON u.base_id = b.id`
  );
  res.json(users);
}
