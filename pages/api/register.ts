// src/pages/api/auth/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = uuidv4();

    const newUser = {
      email,
      password: hashedPassword,
      username,
      emailVerified: false,
      verificationToken,
      progress: {},
      rewards: {},
      createdAt: new Date(),
    };

    await users.insertOne(newUser);
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({ message: 'User registered. Check your email to verify.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
