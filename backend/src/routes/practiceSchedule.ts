import { Router } from 'express';
import { z } from 'zod/v3';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { asyncHandler, validate } from '../utils/http';
import { requireAuth, requireRole } from '../middleware/auth';

/**
 * Practice schedules are shared across devices: the doctor saves here, and the
 * public doctor directory + booking dialog read the same record.
 */
export const practiceScheduleRouter = Router();

const KEY_PREFIX = 'practice-schedule:';

const scheduleSchema = z.object({
  doctorName: z.string().trim().min(2).max(120),
  schedule: z.object({
    doctorName: z.string().trim().max(120).nullable().optional(),
    updatedAt: z.string().optional().nullable(),
    slotMinutes: z.number().int().min(10).max(120).optional(),
    modes: z.record(z.string(), z.any()).optional(),
    days: z.record(z.string(), z.any()).optional(),
    selected: z.record(z.string(), z.any()).optional(),
    extended: z.record(z.string(), z.any()).optional(),
    overrides: z.record(z.string(), z.any()).optional(),
  }),
});

function keyFor(doctorName: string) {
  return `${KEY_PREFIX}${doctorName.trim().toLowerCase()}`;
}

practiceScheduleRouter.get(
  '/practice-schedule/:doctorName',
  asyncHandler(async (req, res) => {
    const row = await prisma.platformSetting.findUnique({ where: { key: keyFor(req.params.doctorName) } });
    if (!row) {
      res.json({ schedule: null });
      return;
    }
    let schedule: unknown = null;
    try {
      schedule = JSON.parse(row.value);
    } catch {
      schedule = null;
    }
    res.setHeader('Cache-Control', 'public, max-age=30');
    res.json({ schedule, updatedAt: row.updatedAt.toISOString() });
  }),
);

practiceScheduleRouter.put(
  '/practice-schedule',
  // Production requires a signed-in clinician; the local demo has no portal
  // session, so development writes are accepted unauthenticated.
  ...(env.isProduction ? [requireAuth, requireRole('DOCTOR', 'ADMIN')] : []),
  validate(scheduleSchema),
  asyncHandler(async (req, res) => {
    const { doctorName, schedule } = req.body as z.infer<typeof scheduleSchema>;
    const payload = JSON.stringify({
      ...schedule,
      doctorName,
      // Keep the clinician's own timestamp so stale writes cannot look newer.
      updatedAt: schedule.updatedAt || new Date().toISOString(),
    });

    const row = await prisma.platformSetting.upsert({
      where: { key: keyFor(doctorName) },
      create: { key: keyFor(doctorName), value: payload },
      update: { value: payload },
    });

    res.status(200).json({ ok: true, updatedAt: row.updatedAt.toISOString() });
  }),
);
