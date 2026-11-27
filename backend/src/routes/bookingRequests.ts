import { Router } from 'express';
import { z } from 'zod/v3';
import { prisma } from '../config/prisma';
import { asyncHandler, validate } from '../utils/http';
import { formLimiter } from '../middleware/rateLimit';
import { bookingRequestSchema } from '../validators/schemas';
import {
  buildBookingSms,
  buildBookingWhatsApp,
  formatWhen,
  normalizePhone,
  sendBookingNotifications,
} from '../services/messaging';
import { audit } from '../utils/audit';
import { recordActivity } from '../services/activity';
import { sendBookingConfirmation } from '../services/mailer';
import { ValidationError } from '../utils/errors';

export const bookingRequestsRouter = Router();

const normalizeDoctorName = (value: string) =>
  String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Short, human-readable reference the patient can quote on a call.
 * Mirrors the `NC-XXXXXX` format the booking dialog has always displayed.
 */
function publicReference() {
  return `NC-${Math.floor(100000 + Math.random() * 900000)}`;
}

bookingRequestsRouter.get(
  '/booking-requests',
  asyncHandler(async (req, res) => {
    const doctorFilter = typeof req.query.doctorName === 'string' ? req.query.doctorName.trim() : '';
    const normalizedFilter = doctorFilter ? normalizeDoctorName(doctorFilter) : '';

    const rows = await prisma.patientActivity.findMany({
      where: { type: 'BOOKING_REQUEST' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const bookings = rows
      .map((row) => {
        const detail = (row.detail && typeof row.detail === 'object' ? row.detail : {}) as Record<string, unknown>;
        const doctorName = typeof detail.doctorName === 'string' ? detail.doctorName : '';
        return {
          id: row.reference,
          reference: row.reference,
          doctorName,
          specialty: typeof detail.specialty === 'string' ? detail.specialty : '',
          patientName: row.patientName || 'Patient',
          phone: row.phone || '',
          email: row.email || '',
          when: typeof detail.when === 'string' ? detail.when : '',
          startAt: typeof detail.startAt === 'string' ? detail.startAt : null,
          dateLabel: typeof detail.dateLabel === 'string' ? detail.dateLabel : null,
          slotLabel: typeof detail.slotLabel === 'string' ? detail.slotLabel : null,
          feeRupees: typeof detail.feeRupees === 'number' ? detail.feeRupees : null,
          durationMinutes: typeof detail.durationMinutes === 'number' ? detail.durationMinutes : 30,
          mode: typeof detail.mode === 'string' ? detail.mode : 'ONLINE',
          age: typeof detail.age === 'string' ? detail.age : '',
          gender: typeof detail.gender === 'string' ? detail.gender : '',
          reason: typeof detail.reason === 'string' ? detail.reason : '',
          status: row.status === 'NEW' ? 'Confirmed' : row.status,
          createdAt: row.createdAt.toISOString(),
        };
      })
      .filter((item) => !normalizedFilter || normalizeDoctorName(item.doctorName) === normalizedFilter);

    res.setHeader('Cache-Control', 'no-store');
    res.json({ bookings });
  }),
);

bookingRequestsRouter.post(
  '/booking-requests',
  formLimiter,
  validate(bookingRequestSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof bookingRequestSchema>;

    const phone = normalizePhone(input.phone);
    if (!phone) {
      throw new ValidationError({ phone: ['Please enter a valid mobile number.'] });
    }

    const reference = publicReference();
    const when = input.startAt
      ? formatWhen(input.startAt, input.timezone)
      : [input.dateLabel, input.slotLabel].filter(Boolean).join(', ') || 'Time to be confirmed';
    const whenWithDuration =
      input.durationMinutes === 60 ? `${when} (1 hour)` : `${when} (30 min)`;

    const messageInput = {
      to: phone,
      reference,
      patientName: input.fullName,
      doctorName: input.doctorName,
      specialty: input.specialty,
      when: whenWithDuration,
      mode: input.mode,
      clinicName: input.clinicName,
      clinicAddress: input.clinicAddress,
      feeRupees: input.feeRupees,
      channels: input.channels,
    };

    const outcome = await sendBookingNotifications(messageInput);
    const emailOutcome = input.email
      ? await sendBookingConfirmation({
          to: input.email,
          bookingId: reference,
          doctorName: input.doctorName,
          startAt: input.startAt ? new Date(input.startAt) : new Date(),
          timezone: input.timezone,
          mode: input.mode,
        })
      : null;

    await audit({
      req,
      action: 'BOOKING_REQUEST_CREATED',
      entityType: 'BookingRequest',
      entityId: reference,
      metadata: {
        doctor: input.doctorName,
        mode: input.mode,
        sms: outcome.sms.delivered ? outcome.sms.mode : outcome.sms.reason ?? 'skipped',
        whatsapp: outcome.whatsapp.delivered ? outcome.whatsapp.mode : outcome.whatsapp.reason ?? 'skipped',
        email: emailOutcome ? (emailOutcome.delivered ? 'sent' : emailOutcome.reason ?? 'skipped') : 'not-provided',
      },
    });

    await recordActivity({
      type: 'BOOKING_REQUEST',
      reference,
      patientName: input.fullName,
      phone: outcome.phone,
      email: input.email ?? null,
      summary: `${input.doctorName}${input.specialty ? ` · ${input.specialty}` : ''} · ${when} · ${input.durationMinutes === 60 ? '1 hour' : '30 min'}`,
      detail: {
        doctorName: input.doctorName,
        specialty: input.specialty ?? null,
        clinicName: input.clinicName ?? null,
        mode: input.mode,
        when,
        startAt: input.startAt ?? null,
        dateLabel: input.dateLabel ?? null,
        slotLabel: input.slotLabel ?? null,
        age: input.age ?? null,
        gender: input.gender ?? null,
        reason: input.reason ?? null,
        feeRupees: input.feeRupees ?? null,
        durationMinutes: input.durationMinutes ?? 30,
        sms: outcome.sms.delivered,
        whatsapp: outcome.whatsapp.delivered,
        email: Boolean(emailOutcome?.delivered),
      },
    });

    const delivered = [
      outcome.sms.delivered ? 'SMS' : null,
      outcome.whatsapp.delivered ? 'WhatsApp' : null,
      emailOutcome?.delivered ? 'Email' : null,
    ].filter(Boolean) as string[];

    res.status(201).json({
      reference,
      phone: outcome.phone,
      notifications: {
        sms: outcome.sms,
        whatsapp: outcome.whatsapp,
        ...(emailOutcome ? { email: emailOutcome } : {}),
      },
      previews: {
        sms: buildBookingSms(messageInput),
        whatsapp: buildBookingWhatsApp(messageInput),
      },
      message: delivered.length
        ? `Booking details sent to ${outcome.phone} by ${delivered.join(' and ')}.`
        : 'Booking reference created. SMS and WhatsApp delivery are not enabled on this environment.',
    });
  }),
);
