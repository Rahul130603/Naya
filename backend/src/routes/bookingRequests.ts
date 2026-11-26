import { Router } from 'express';
import { z } from 'zod/v3';
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
import { sendBookingConfirmation } from '../services/mailer';
import { ValidationError } from '../utils/errors';

export const bookingRequestsRouter = Router();

/**
 * Short, human-readable reference the patient can quote on a call.
 * Mirrors the `NC-XXXXXX` format the booking dialog has always displayed.
 */
function publicReference() {
  return `NC-${Math.floor(100000 + Math.random() * 900000)}`;
}

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

    const messageInput = {
      to: phone,
      reference,
      patientName: input.fullName,
      doctorName: input.doctorName,
      specialty: input.specialty,
      when,
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
