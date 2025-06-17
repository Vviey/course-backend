// src/pages/api/auth/verify.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Invalid token' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mycourseapp');

    const users = db.collection('users');

    const user = await users.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired verification token' });
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: '' },
      }
    );

    return res.status(200).json({ message: 'Email successfully verified' });
    // OR: res.redirect('/login?verified=true');
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
