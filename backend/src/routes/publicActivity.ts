import { Router } from 'express';
import { z } from 'zod/v3';
import { asyncHandler, validate } from '../utils/http';
import { formLimiter } from '../middleware/rateLimit';
import { recordActivity } from '../services/activity';
import { normalizePhone } from '../services/messaging';

/**
 * Lightweight endpoints the public marketing site calls so every store order and
 * video/audio consult request reaches the admin operations console.
 */
export const publicActivityRouter = Router();

function reference(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

const storeOrderSchema = z.object({
  reference: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().max(120).optional(),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  totalRupees: z.number().min(0).max(500000),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(80).optional(),
  postcode: z.string().trim().max(10).optional(),
  paymentMode: z.enum(['COD', 'ONLINE']).default('COD'),
});

publicActivityRouter.post(
  '/store-orders',
  formLimiter,
  validate(storeOrderSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof storeOrderSchema>;
    const ref = input.reference || reference('NC-ORD');

    await recordActivity({
      type: 'STORE_ORDER',
      reference: ref,
      patientName: input.fullName,
      phone: normalizePhone(input.phone) ?? input.phone,
      email: input.email ?? null,
      summary: `${input.items.length} item${input.items.length === 1 ? '' : 's'} · ₹${input.totalRupees} · ${input.paymentMode === 'COD' ? 'Pay on delivery' : 'Paid online'}`,
      detail: {
        items: input.items,
        totalRupees: input.totalRupees,
        city: input.city ?? null,
        postcode: input.postcode ?? null,
        address: input.address ?? null,
        paymentMode: input.paymentMode,
      },
    });

    res.status(201).json({ reference: ref, message: 'Order received.' });
  }),
);

const consultRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  doctorName: z.string().trim().max(120).optional(),
  mode: z.enum(['VIDEO', 'AUDIO']).default('VIDEO'),
  preferredTime: z.string().trim().max(60).optional(),
});

publicActivityRouter.post(
  '/consult-requests',
  formLimiter,
  validate(consultRequestSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof consultRequestSchema>;
    const ref = reference('NC-CON');

    await recordActivity({
      type: 'VIDEO_CONSULT',
      reference: ref,
      patientName: input.fullName,
      phone: normalizePhone(input.phone) ?? input.phone,
      summary: `${input.mode === 'AUDIO' ? 'Audio' : 'Video'} consult${input.doctorName ? ` · ${input.doctorName}` : ''}${input.preferredTime ? ` · ${input.preferredTime}` : ''}`,
      detail: {
        doctorName: input.doctorName ?? null,
        mode: input.mode,
        preferredTime: input.preferredTime ?? null,
      },
    });

    res.status(201).json({ reference: ref, message: 'Consultation request received.' });
  }),
);
