import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => argon2.hash(password, {
  type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1,
});

// bcrypt is accepted only to migrate existing accounts on successful login.
export const verifyPassword = (password: string, encoded: string) =>
  encoded.startsWith('$argon2') ? argon2.verify(encoded, password) : bcrypt.compare(password, encoded);
