// src/models/user.ts

export interface User {
  _id?: string;
  email: string;
  password: string;
  username: string;
  emailVerified: boolean;
  verificationToken: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: number | null;

}
