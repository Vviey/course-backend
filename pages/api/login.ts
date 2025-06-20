// src/pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { comparePasswords } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'mycourseapp'; // explicitly use your DB name

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
