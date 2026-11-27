import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

/**
 * Ledger of patient-facing actions for the admin operations console.
 *
 * Deliberately separate from clinical tables: the admin view shows *that* a
 * patient booked, ordered or consulted — never consultation content.
 */

export type ActivityType = 'BOOKING_REQUEST' | 'STORE_ORDER' | 'VIDEO_CONSULT' | 'PRESCRIPTION';

export type ActivityInput = {
  type: ActivityType;
  reference: string;
  patientName?: string | null;
  phone?: string | null;
  email?: string | null;
  summary: string;
  detail?: Record<string, unknown> | null;
};

export async function recordActivity(input: ActivityInput) {
  try {
    return await prisma.patientActivity.create({
      data: {
        type: input.type,
        reference: input.reference,
        patientName: input.patientName ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        summary: input.summary.slice(0, 300),
        detail: input.detail ? (input.detail as object) : undefined,
      },
    });
  } catch (error) {
    logger.warn('activity.record_failed', {
      type: input.type,
      reference: input.reference,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function listActivity(options: {
  type?: string;
  search?: string;
  limit?: number;
} = {}) {
  const where: Record<string, unknown> = {};
  if (options.type && options.type !== 'ALL') where.type = options.type;
  if (options.search) {
    where.OR = [
      { reference: { contains: options.search, mode: 'insensitive' } },
      { patientName: { contains: options.search, mode: 'insensitive' } },
      { phone: { contains: options.search } },
      { summary: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.patientActivity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(options.limit ?? 100, 1), 300),
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    reference: row.reference,
    patientName: row.patientName,
    phone: row.phone,
    email: row.email,
    summary: row.summary,
    detail: row.detail,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}
