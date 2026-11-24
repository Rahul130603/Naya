import * as OTPAuth from 'otpauth';
import { prisma } from '../config/prisma';
import { decryptText, encryptText, hashToken, randomToken } from '../utils/crypto';
import { UnauthorizedError } from '../utils/errors';

const totpFor = (email: string, secret: string) => new OTPAuth.TOTP({
  issuer: 'Nayacura', label: email, algorithm: 'SHA1', digits: 6, period: 30,
  secret: OTPAuth.Secret.fromBase32(secret),
});

export async function beginAdminMfa(userId: string, email: string) {
  const profile = await prisma.adminProfile.upsert({ where: { userId }, create: { userId }, update: {} });
  const enrollmentRequired = !profile.mfaEnabledAt;
  const secret = enrollmentRequired ? new OTPAuth.Secret({ size: 20 }).base32 : null;
  const challenge = randomToken(32);
  await prisma.mfaChallenge.create({ data: {
    userId, tokenHash: hashToken(challenge), expiresAt: new Date(Date.now() + 5 * 60_000),
    encryptedSecret: secret ? encryptText(secret) : null,
  } });
  return {
    mfaRequired: true, enrollmentRequired, challenge,
    enrollment: secret ? { secret, uri: totpFor(email, secret).toString() } : undefined,
  };
}

export async function completeAdminMfa(challenge: string, code: string) {
  const record = await prisma.mfaChallenge.findUnique({
    where: { tokenHash: hashToken(challenge) }, include: { user: { include: { admin: true } } },
  });
  const profile = record?.user.admin;
  if (!record || record.usedAt || record.expiresAt <= new Date() || record.user.deletedAt ||
      record.user.role !== 'ADMIN' || !profile) throw new UnauthorizedError('Sign in again to request a new security code.');
  // A parallel enrollment must never replace an already activated factor.
  if (record.encryptedSecret && profile.mfaEnabledAt) throw new UnauthorizedError('Authenticator already enrolled. Sign in again.');
  const encoded = record.encryptedSecret || profile.encryptedMfaSecret;
  if (!encoded) throw new UnauthorizedError('Authenticator setup is required.');
  const delta = totpFor(record.user.email, decryptText(encoded)).validate({ token: code, window: 1 });
  if (delta === null) throw new UnauthorizedError('The authenticator code is incorrect or expired.');
  const step = Math.floor(Date.now() / 30_000) + delta;
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.mfaChallenge.updateMany({ where: {
      id: record.id, usedAt: null, expiresAt: { gt: new Date() },
    }, data: { usedAt: new Date() } });
    if (!consumed.count) throw new UnauthorizedError('This challenge has already been used.');
    const updated = await tx.adminProfile.updateMany({ where: {
      id: profile.id, lastUsedStep: { lt: step },
      ...(record.encryptedSecret ? { mfaEnabledAt: null } : {}),
    }, data: {
      lastUsedStep: step, ...(record.encryptedSecret ? {
        encryptedMfaSecret: record.encryptedSecret, mfaEnabledAt: new Date(),
      } : {}),
    } });
    if (!updated.count) throw new UnauthorizedError('Code already used. Wait for the next authenticator code.');
  });
  return record.user;
}
