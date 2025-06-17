// src/lib/mail.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // change if using Mailgun, SendGrid, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"Bitcoin Course" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `
      <h2>Welcome to the Bitcoin Learning Platform!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire after first use.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to', to);
  } catch (err) {
    console.error('Failed to send verification email:', err);
    throw new Error('Email sending failed.');
  }
}
