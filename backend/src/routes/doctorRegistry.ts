import { Router } from 'express';
import { z } from 'zod/v3';
import { prisma } from '../config/prisma';
import { asyncHandler, validate } from '../utils/http';

/**
 * Shared clinician application and approved profile registry backed by
 * PlatformSetting so new doctor registrations, admin approvals, logins, and
 * the public Consult Sexology directory stay synchronized across devices.
 */
export const doctorRegistryRouter = Router();

const APP_PREFIX = 'doctor-registry:app:';
const ACC_PREFIX = 'doctor-registry:acc:';
const PROFILE_PREFIX = 'doctor-registry:profile:';
const PATIENT_ACC_PREFIX = 'patient-registry:acc:';

export const EMAIL_ALREADY_USED_MESSAGE =
  'This email is already used. Please sign in or use a different email address.';

const RESERVED_PLATFORM_EMAILS = new Set([
  'dr.arvind@nayacura.clinic',
  'suresh.kumar@nayacura.patient',
  'admin@nayacura.internal',
  'dr.annamalai@medtrust.org',
  'dr.sneha@vitalityclinic.in',
  'hello@nayacura.com',
  'support@nayacura.com',
  'patient@nayacura.demo',
  'doctor@nayacura.demo',
  'admin@nayacura.demo',
  'ishaan.kapoor@nayacura.demo',
]);

const patientAccountSchema = z.object({
  id: z.string().trim().min(3).max(60),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  city: z.string().trim().max(120).optional(),
  createdAt: z.string().optional(),
});

export function normalizeRegistryEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

export async function isEmailUsedInRegistry(
  rawEmail: string,
  options: { excludeApplicationId?: string } = {},
): Promise<boolean> {
  const normalized = normalizeRegistryEmail(rawEmail);
  if (!normalized) return false;
  if (RESERVED_PLATFORM_EMAILS.has(normalized)) return true;

  const [existingUser, appRows, accRows, patientRows] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalized }, select: { id: true } }),
    prisma.platformSetting.findMany({ where: { key: { startsWith: APP_PREFIX } } }),
    prisma.platformSetting.findMany({ where: { key: { startsWith: ACC_PREFIX } } }),
    prisma.platformSetting.findMany({ where: { key: { startsWith: PATIENT_ACC_PREFIX } } }),
  ]);

  if (existingUser) return true;

  for (const row of appRows) {
    const parsed = parseJson<Record<string, unknown>>(row.value);
    if (!parsed) continue;
    if (options.excludeApplicationId && String(parsed.id || '') === options.excludeApplicationId) {
      continue;
    }
    if (normalizeRegistryEmail(String(parsed.email || '')) === normalized) {
      return true;
    }
  }

  for (const row of [...accRows, ...patientRows]) {
    const parsed = parseJson<Record<string, unknown>>(row.value);
    if (!parsed) continue;
    if (normalizeRegistryEmail(String(parsed.email || '')) === normalized) {
      return true;
    }
  }

  return false;
}

const applicationSchema = z.object({
  id: z.string().trim().min(3).max(60),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  city: z.string().trim().min(1).max(120),
  languages: z.string().trim().min(1).max(200),
  specialty: z.string().trim().min(2).max(120),
  qualification: z.string().trim().min(1).max(200),
  university: z.string().trim().max(200).optional(),
  graduationYear: z.string().trim().max(10).optional(),
  experience: z.string().trim().min(1).max(40),
  council: z.string().trim().min(1).max(160),
  regNo: z.string().trim().min(1).max(80),
  certificateName: z.string().trim().max(200).optional(),
  cvName: z.string().trim().max(200).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  submittedAt: z.string().optional(),
});

const accountSchema = z.object({
  id: z.string().trim().min(3).max(60),
  applicationId: z.string().trim().max(60).optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(4).max(120),
  regNo: z.string().trim().max(80).optional(),
  council: z.string().trim().max(160).optional(),
  specialty: z.string().trim().max(120).optional(),
  qualifications: z.string().trim().max(200).optional(),
  university: z.string().trim().max(200).optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  city: z.string().trim().max(120).optional(),
  clinicName: z.string().trim().max(160).optional(),
  fee: z.number().optional(),
  videoFee: z.number().optional(),
  role: z.string().optional(),
  approvedAt: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(2).max(160),
  password: z.string().min(1).max(120),
});

const doctorProfileUpdateSchema = z.object({
  id: z.string().trim().max(60).optional(),
  email: z.string().trim().email().max(160).optional(),
  name: z.string().trim().min(2).max(120),
  regNo: z.string().trim().max(80).optional(),
  council: z.string().trim().max(160).optional(),
  specialty: z.string().trim().max(120).optional(),
  qualifications: z.string().trim().max(200).optional(),
  experience: z.union([z.string(), z.number()]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  city: z.string().trim().max(120).optional(),
  clinic: z.string().trim().max(160).optional(),
  clinicName: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  about: z.string().trim().max(1000).optional(),
  fee: z.number().min(0).max(100000).optional(),
  videoFee: z.number().min(0).max(100000).optional(),
  photoUrl: z.string().max(400000).optional(),
});

const doctorChangePasswordSchema = z.object({
  id: z.string().trim().max(60).optional(),
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional(),
  regNo: z.string().trim().max(80).optional(),
  council: z.string().trim().max(160).optional(),
  specialty: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  clinicName: z.string().trim().max(160).optional(),
  currentPassword: z.string().max(120).optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.').max(120),
});

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toPublicDoctor(account: Record<string, unknown>) {
  return {
    id: account.id,
    name: account.name,
    regNo: account.regNo || 'NMC-VERIFIED',
    council: account.council || 'Medical Council',
    specialty: account.specialty || 'Clinical Sexologist',
    qualifications: account.qualifications || '',
    university: account.university || '',
    experience: account.experience || '',
    languages: account.languages || '',
    city: account.city || 'Chennai',
    clinicName: account.clinicName || account.clinic || 'Nayacura Partner Clinic',
    phone: account.phone || '',
    about: account.about || '',
    photoUrl: account.photoUrl || '',
    fee: account.fee,
    videoFee: account.videoFee,
    role: 'doctor',
    approvedAt: account.approvedAt,
  };
}

doctorRegistryRouter.get(
  '/doctor-registry/public',
  asyncHandler(async (_req, res) => {
    const [rows, profileRows] = await Promise.all([
      prisma.platformSetting.findMany({
        where: { key: { startsWith: ACC_PREFIX } },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.platformSetting.findMany({
        where: { key: { startsWith: PROFILE_PREFIX } },
      }),
    ]);
    const profiles = new Map<string, Record<string, unknown>>();
    for (const row of profileRows) {
      const parsed = parseJson<Record<string, unknown>>(row.value);
      if (parsed) profiles.set(row.key, parsed);
    }
    const doctors = rows
      .map((row) => parseJson<Record<string, unknown>>(row.value))
      .filter((item): item is Record<string, unknown> => Boolean(item && item.approvedAt))
      .map((item) => {
        const pKey = profileLookupKey(String(item.email || ''), String(item.name || ''));
        const override = pKey ? profiles.get(pKey) : undefined;
        return toPublicDoctor(override ? { ...item, ...override, id: item.id, approvedAt: item.approvedAt } : item);
      });
    res.setHeader('Cache-Control', 'no-store');
    res.json({ doctors });
  }),
);

doctorRegistryRouter.get(
  '/doctor-registry/applications',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.platformSetting.findMany({
      where: { key: { startsWith: APP_PREFIX } },
      orderBy: { updatedAt: 'desc' },
    });
    const applications = rows
      .map((row) => parseJson<Record<string, unknown>>(row.value))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
    res.setHeader('Cache-Control', 'no-store');
    res.json({ applications });
  }),
);

doctorRegistryRouter.get(
  '/registry/check-email',
  asyncHandler(async (req, res) => {
    const email = normalizeRegistryEmail(String(req.query.email || ''));
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.json({ available: true });
      return;
    }
    const used = await isEmailUsedInRegistry(email);
    res.setHeader('Cache-Control', 'no-store');
    if (used) {
      res.json({
        available: false,
        code: 'EMAIL_ALREADY_USED',
        message: EMAIL_ALREADY_USED_MESSAGE,
      });
      return;
    }
    res.json({ available: true });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/applications',
  validate(applicationSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof applicationSchema>;
    const normalizedEmail = normalizeRegistryEmail(input.email);
    const used = await isEmailUsedInRegistry(normalizedEmail, {
      excludeApplicationId: input.id,
    });
    if (used) {
      res.status(409).json({
        code: 'EMAIL_ALREADY_USED',
        message: EMAIL_ALREADY_USED_MESSAGE,
      });
      return;
    }
    const payload = {
      ...input,
      email: normalizedEmail,
      status: input.status || 'pending',
      submittedAt: input.submittedAt || new Date().toISOString(),
    };
    await prisma.platformSetting.upsert({
      where: { key: `${APP_PREFIX}${input.id}` },
      create: { key: `${APP_PREFIX}${input.id}`, value: JSON.stringify(payload) },
      update: { value: JSON.stringify(payload) },
    });
    res.status(201).json({ application: payload });
  }),
);

doctorRegistryRouter.post(
  '/patient-registry/accounts',
  validate(patientAccountSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof patientAccountSchema>;
    const normalizedEmail = normalizeRegistryEmail(input.email);
    const used = await isEmailUsedInRegistry(normalizedEmail);
    if (used) {
      res.status(409).json({
        code: 'EMAIL_ALREADY_USED',
        message: EMAIL_ALREADY_USED_MESSAGE,
      });
      return;
    }
    const payload = {
      id: input.id,
      name: input.name,
      email: normalizedEmail,
      role: 'patient',
      city: input.city || 'Chennai',
      createdAt: input.createdAt || new Date().toISOString(),
    };
    await prisma.platformSetting.upsert({
      where: { key: `${PATIENT_ACC_PREFIX}${normalizedEmail}` },
      create: { key: `${PATIENT_ACC_PREFIX}${normalizedEmail}`, value: JSON.stringify(payload) },
      update: { value: JSON.stringify(payload) },
    });
    res.status(201).json({ patient: payload });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/accounts',
  validate(accountSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof accountSchema>;
    const payload = {
      ...input,
      role: 'doctor',
      approvedAt: input.approvedAt || new Date().toISOString(),
    };
    await prisma.platformSetting.upsert({
      where: { key: `${ACC_PREFIX}${input.id}` },
      create: { key: `${ACC_PREFIX}${input.id}`, value: JSON.stringify(payload) },
      update: { value: JSON.stringify(payload) },
    });

    if (input.applicationId) {
      const appKey = `${APP_PREFIX}${input.applicationId}`;
      const existingApp = await prisma.platformSetting.findUnique({ where: { key: appKey } });
      if (existingApp) {
        const parsed = parseJson<Record<string, unknown>>(existingApp.value);
        if (parsed) {
          await prisma.platformSetting.update({
            where: { key: appKey },
            data: {
              value: JSON.stringify({
                ...parsed,
                status: 'approved',
                doctorId: input.id,
                approvedAt: payload.approvedAt,
              }),
            },
          });
        }
      }
    }

    res.status(201).json({ doctor: toPublicDoctor(payload) });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/applications/:id/reject',
  asyncHandler(async (req, res) => {
    const appKey = `${APP_PREFIX}${req.params.id}`;
    const existing = await prisma.platformSetting.findUnique({ where: { key: appKey } });
    if (existing) {
      const parsed = parseJson<Record<string, unknown>>(existing.value);
      if (parsed) {
        await prisma.platformSetting.update({
          where: { key: appKey },
          data: {
            value: JSON.stringify({
              ...parsed,
              status: 'rejected',
              rejectedAt: new Date().toISOString(),
            }),
          },
        });
      }
    }
    res.json({ ok: true });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body as z.infer<typeof loginSchema>;
    const normalized = identifier.trim().toLowerCase();

    const accountRows = await prisma.platformSetting.findMany({
      where: { key: { startsWith: ACC_PREFIX } },
    });
    const matched = accountRows
      .map((row) => parseJson<Record<string, unknown>>(row.value))
      .find((item) => (
        item && (
          String(item.email || '').trim().toLowerCase() === normalized
          || String(item.id || '').trim().toLowerCase() === normalized
          || String(item.regNo || '').trim().toLowerCase() === normalized
        )
      ));

    if (matched) {
      if (String(matched.password || '') !== password) {
        res.status(401).json({
          status: 'invalid_password',
          message: 'Incorrect password. Use the temporary password from your credentials email.',
        });
        return;
      }
      const pKey = profileLookupKey(String(matched.email || ''), String(matched.name || ''));
      const profileRow = pKey ? await prisma.platformSetting.findUnique({ where: { key: pKey } }) : null;
      const profileOverride = profileRow ? parseJson<Record<string, unknown>>(profileRow.value) : null;
      const merged = profileOverride
        ? { ...matched, ...profileOverride, id: matched.id, email: matched.email }
        : matched;
      res.json({
        status: 'ok',
        account: {
          ...toPublicDoctor(merged),
          email: matched.email,
        },
      });
      return;
    }

    const appRows = await prisma.platformSetting.findMany({
      where: { key: { startsWith: APP_PREFIX } },
    });
    const matchedApp = appRows
      .map((row) => parseJson<Record<string, unknown>>(row.value))
      .find((item) => item && String(item.email || '').trim().toLowerCase() === normalized);

    if (matchedApp?.status === 'pending') {
      res.status(403).json({
        status: 'pending',
        message: 'Your clinician application is still under review. Credentials arrive by email after approval.',
      });
      return;
    }
    if (matchedApp?.status === 'rejected') {
      res.status(403).json({
        status: 'rejected',
        message: 'This application was not approved. Write to support@nayacura.com for assistance.',
      });
      return;
    }

    res.status(404).json({ status: 'not_found' });
  }),
);

function profileLookupKey(email?: string, name?: string) {
  const cleanEmail = normalizeRegistryEmail(email || '');
  if (cleanEmail) return `${PROFILE_PREFIX}${cleanEmail}`;
  const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, '-');
  return cleanName ? `${PROFILE_PREFIX}name:${cleanName}` : '';
}

doctorRegistryRouter.get(
  '/doctor-registry/profile',
  asyncHandler(async (req, res) => {
    const email = normalizeRegistryEmail(String(req.query.email || ''));
    const name = String(req.query.name || '').trim();
    const key = profileLookupKey(email, name);
    if (!key) {
      res.json({ profile: null });
      return;
    }
    const row = await prisma.platformSetting.findUnique({ where: { key } });
    const parsed = row ? parseJson<Record<string, unknown>>(row.value) : null;
    res.setHeader('Cache-Control', 'no-store');
    res.json({ profile: parsed });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/profile',
  validate(doctorProfileUpdateSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof doctorProfileUpdateSchema>;
    const normalizedEmail = normalizeRegistryEmail(input.email || '');
    const key = profileLookupKey(normalizedEmail, input.name);
    const updatedAt = new Date().toISOString();
    const profilePayload = {
      ...input,
      email: normalizedEmail || input.email || '',
      clinicName: input.clinicName || input.clinic || 'Nayacura Partner Clinic',
      clinic: input.clinic || input.clinicName || 'Nayacura Partner Clinic',
      updatedAt,
    };

    if (key) {
      await prisma.platformSetting.upsert({
        where: { key },
        create: { key, value: JSON.stringify(profilePayload) },
        update: { value: JSON.stringify(profilePayload) },
      });
    }

    const accountRows = await prisma.platformSetting.findMany({
      where: { key: { startsWith: ACC_PREFIX } },
    });
    for (const row of accountRows) {
      const account = parseJson<Record<string, unknown>>(row.value);
      if (!account) continue;
      const matchesEmail = normalizedEmail && normalizeRegistryEmail(String(account.email || '')) === normalizedEmail;
      const matchesId = input.id && String(account.id || '') === input.id;
      if (matchesEmail || matchesId) {
        const merged = {
          ...account,
          name: input.name,
          regNo: input.regNo ?? account.regNo,
          council: input.council ?? account.council,
          specialty: input.specialty ?? account.specialty,
          qualifications: input.qualifications ?? account.qualifications,
          experience: input.experience ?? account.experience,
          languages: input.languages ?? account.languages,
          city: input.city ?? account.city,
          clinicName: profilePayload.clinicName,
          phone: input.phone ?? account.phone,
          about: input.about ?? account.about,
          fee: input.fee ?? account.fee,
          videoFee: input.videoFee ?? account.videoFee,
          photoUrl: input.photoUrl !== undefined ? input.photoUrl : account.photoUrl,
          updatedAt,
        };
        await prisma.platformSetting.update({
          where: { key: row.key },
          data: { value: JSON.stringify(merged) },
        });
      }
    }

    res.json({ ok: true, profile: profilePayload });
  }),
);

doctorRegistryRouter.post(
  '/doctor-registry/change-password',
  validate(doctorChangePasswordSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof doctorChangePasswordSchema>;
    const normalizedEmail = normalizeRegistryEmail(input.email);

    const accountRows = await prisma.platformSetting.findMany({
      where: { key: { startsWith: ACC_PREFIX } },
    });
    const matchedRow = accountRows.find((row) => {
      const item = parseJson<Record<string, unknown>>(row.value);
      if (!item) return false;
      const sameEmail = normalizeRegistryEmail(String(item.email || '')) === normalizedEmail;
      const sameId = input.id && String(item.id || '') === input.id;
      return sameEmail || Boolean(sameId);
    });

    if (matchedRow) {
      const existing = parseJson<Record<string, unknown>>(matchedRow.value) || {};
      if (existing.password && String(existing.password) !== String(input.currentPassword || '')) {
        res.status(400).json({
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect.',
        });
        return;
      }
      await prisma.platformSetting.update({
        where: { key: matchedRow.key },
        data: {
          value: JSON.stringify({
            ...existing,
            password: input.newPassword,
            passwordUpdatedAt: new Date().toISOString(),
          }),
        },
      });
      res.json({ ok: true, message: 'Password updated successfully.' });
      return;
    }

    const accountId = input.id || `NC-DOC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const createdAccount = {
      id: accountId,
      name: input.name || 'Clinician',
      email: normalizedEmail,
      password: input.newPassword,
      regNo: input.regNo || 'NMC-VERIFIED',
      council: input.council || 'Medical Council',
      specialty: input.specialty || 'Clinical Sexologist',
      city: input.city || 'Chennai',
      clinicName: input.clinicName || 'Nayacura Partner Clinic',
      role: 'doctor',
      passwordUpdatedAt: new Date().toISOString(),
    };
    await prisma.platformSetting.upsert({
      where: { key: `${ACC_PREFIX}${accountId}` },
      create: { key: `${ACC_PREFIX}${accountId}`, value: JSON.stringify(createdAccount) },
      update: { value: JSON.stringify(createdAccount) },
    });
    res.json({ ok: true, id: accountId, message: 'Password updated successfully.' });
  }),
);
