import { existsSync } from 'node:fs';
import path from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { formatDateTime } from '../utils/dates';

const EMAIL_ASSETS_DIR = path.resolve(__dirname, '../../assets');
const INLINE_ASSETS: Array<{ cid: string; filename: string }> = [
  { cid: 'nayacura-logo', filename: 'nayacura-logo.png' },
  { cid: 'email-top-wave', filename: 'email-top-wave.png' },
  { cid: 'email-hero-devices', filename: 'email-hero-devices.png' },
  { cid: 'email-footer-wave', filename: 'email-footer-wave.png' },
  { cid: 'icon-consult', filename: 'icon-consult.png' },
  { cid: 'icon-lab', filename: 'icon-lab.png' },
  { cid: 'icon-shield', filename: 'icon-shield.png' },
  { cid: 'icon-box', filename: 'icon-box.png' },
];

function collectInlineAttachments(html?: string): Mail.Attachment[] {
  if (!html) return [];
  return INLINE_ASSETS.filter((asset) => html.includes(`cid:${asset.cid}`))
    .map((asset) => {
      const fullPath = path.join(EMAIL_ASSETS_DIR, asset.filename);
      if (!existsSync(fullPath)) return null;
      return {
        filename: asset.filename,
        path: fullPath,
        cid: asset.cid,
        contentDisposition: 'inline' as const,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

let transporter: Transporter | null = null;
let etherealTransporter: Transporter | null = null;

export type MailSendResult =
  | { delivered: true; mode: 'smtp'; reason?: undefined; previewUrl?: undefined }
  | {
      delivered: false;
      mode: 'ethereal' | 'skipped' | 'failed';
      reason: string;
      previewUrl?: string;
    };

function getTransporter() {
  if (!env.smtpConfigured) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT === 587,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: { minVersion: 'TLSv1.2' },
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  const account = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
  return etherealTransporter;
}

type EmailCardDetail = { label: string; value: string; accent?: boolean };

type BrandEmailCardInput = {
  badge: string;
  titlePrefix: string;
  titleAccent?: string;
  greeting: string;
  intro: string;
  secondaryText?: string;
  details?: EmailCardDetail[];
  showFeatures?: boolean;
  showHeroDevices?: boolean;
  cta?: { label: string; url: string };
  note?: string;
  signoff?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderBrandEmailCard(input: BrandEmailCardInput): string {
  const showDevices = input.showHeroDevices !== false;
  const showFeatures = input.showFeatures !== false;

  const detailsHtml = input.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 6px;background:#F8FBFF;border:1px solid #DCE7F6;border-radius:12px;border-collapse:separate;">
        <tr><td style="padding:14px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${input.details
              .map(
                (item, idx) => `<tr>
                  <td style="padding:6px 0;font-size:12px;color:#526987;font-weight:600;${idx < input.details!.length - 1 ? 'border-bottom:1px solid #E8F0FA;' : ''}">${escapeHtml(item.label)}</td>
                  <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:${item.accent ? '#16A34A' : '#0F294A'};font-family:${item.accent ? 'Consolas,Monaco,monospace' : 'inherit'};${idx < input.details!.length - 1 ? 'border-bottom:1px solid #E8F0FA;' : ''}">${escapeHtml(item.value)}</td>
                </tr>`,
              )
              .join('')}
          </table>
        </td></tr>
      </table>`
    : '';

  const ctaHtml = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 4px;">
        <tr>
          <td style="border-radius:999px;background:#169B24;">
            <a href="${escapeHtml(input.cta.url)}" target="_blank" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">${escapeHtml(input.cta.label)} &rarr;</a>
          </td>
        </tr>
      </table>`
    : '';

  const featuresHtml = showFeatures
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 16px;background:#F4F7FA;border:1px solid #E2E8F0;border-radius:14px;border-collapse:separate;">
        <tr class="nc-feat-row">
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td width="34" valign="middle"><img src="cid:icon-consult" alt="" width="30" height="30" style="display:block;border:0;" /></td>
              <td valign="middle" style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Book Consultations</div><div style="font-size:10px;color:#475569;margin-top:2px;">Online or In-Clinic</div></td>
            </tr></table>
          </td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td width="34" valign="middle"><img src="cid:icon-lab" alt="" width="30" height="30" style="display:block;border:0;" /></td>
              <td valign="middle" style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Lab Tests</div><div style="font-size:10px;color:#475569;margin-top:2px;">At-Home &amp; Discreet</div></td>
            </tr></table>
          </td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td width="34" valign="middle"><img src="cid:icon-shield" alt="" width="30" height="30" style="display:block;border:0;" /></td>
              <td valign="middle" style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Confidential &amp; Private</div><div style="font-size:10px;color:#475569;margin-top:2px;">Your Privacy, Our Priority</div></td>
            </tr></table>
          </td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td width="34" valign="middle"><img src="cid:icon-box" alt="" width="30" height="30" style="display:block;border:0;" /></td>
              <td valign="middle" style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Wellness Orders</div><div style="font-size:10px;color:#475569;margin-top:2px;">Plain-Box Delivery</div></td>
            </tr></table>
          </td>
        </tr>
      </table>`
    : '';

  const noteHtml = input.note
    ? `<div style="margin:14px 0 0;padding:10px 14px;border:1px dashed #CBD5E1;border-radius:10px;background:#F8FAFC;font-size:12px;line-height:1.5;color:#475569;">${escapeHtml(input.note)}</div>`
    : '';

  const heroRightHtml = showDevices
    ? `<td class="nc-hero-right" width="248" valign="middle" align="right" style="padding-left:10px;">
        <img class="nc-hero-img" src="cid:email-hero-devices" alt="Nayacura Care Portal" width="240" style="display:block;width:240px;max-width:100%;height:auto;border:0;" />
      </td>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  @media only screen and (max-width: 600px) {
    .nc-wrap { padding: 12px 6px !important; }
    .nc-hdr-pad { padding: 14px 0 6px 16px !important; }
    .nc-wave-top { width: 108px !important; }
    .nc-logo-img { width: 126px !important; }
    .nc-tagline { padding-left: 10px !important; font-size: 11px !important; }
    .nc-pad { padding: 10px 18px 8px !important; }
    .nc-hero-left { display: block !important; width: 100% !important; padding-right: 0 !important; box-sizing: border-box !important; }
    .nc-hero-right { display: block !important; width: 100% !important; padding: 18px 0 4px !important; text-align: center !important; box-sizing: border-box !important; }
    .nc-hero-img { margin: 0 auto !important; width: 255px !important; max-width: 92% !important; }
    .nc-title { font-size: 24px !important; }
    .nc-cta-wrap { width: 100% !important; }
    .nc-cta-btn { display: block !important; text-align: center !important; }
    .nc-feat-row { display: block !important; width: 100% !important; font-size: 0 !important; }
    .nc-feat-cell { display: inline-block !important; width: 49% !important; vertical-align: top !important; box-sizing: border-box !important; border-right: none !important; padding: 10px 8px !important; }
    .nc-footer-text { font-size: 11px !important; line-height: 1.7 !important; padding: 6px 14px 16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#EDF2F7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="nc-wrap" style="background:#EDF2F7;padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="650" cellpadding="0" cellspacing="0" style="max-width:650px;width:100%;background:#FFFFFF;border:1px solid #DCE7F6;border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(15,41,74,0.08);">
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="nc-hdr-pad" valign="middle" style="padding:18px 0 8px 26px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right:12px;">
                          <img class="nc-logo-img" src="cid:nayacura-logo" alt="nayacura" width="142" style="display:block;width:142px;height:auto;border:0;" />
                        </td>
                        <td class="nc-tagline" valign="middle" style="border-left:1px solid #CBD5E1;padding-left:12px;font-size:12px;line-height:1.3;color:#334155;font-weight:600;">
                          Sexual Wellness &amp;<br>Relationship Care
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="nc-wave-top" width="180" valign="top" align="right" style="padding:0;">
                    <img class="nc-wave-top" src="cid:email-top-wave" alt="" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="nc-pad" style="padding:10px 28px 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="nc-hero-left" valign="top" style="padding-right:8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                      <tr>
                        <td style="background:#E8F8EA;border-radius:999px;padding:4px 12px 4px 6px;">
                          <span style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;border-radius:999px;background:#1EA12B;color:#FFFFFF;font-size:11px;font-weight:800;vertical-align:middle;">&#10003;</span>
                          <span style="font-size:11px;font-weight:800;color:#15803D;letter-spacing:0.4px;vertical-align:middle;padding-left:4px;">${escapeHtml(input.badge)}</span>
                        </td>
                      </tr>
                    </table>
                    <h1 class="nc-title" style="margin:0 0 10px;font-size:25px;line-height:1.18;font-weight:800;color:#0F294A;">
                      ${escapeHtml(input.titlePrefix)}${input.titleAccent ? `<span style="color:#1EA12B;">${escapeHtml(input.titleAccent)}</span>` : ''}
                    </h1>
                    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0F294A;">${escapeHtml(input.greeting)}</p>
                    <p style="margin:0 0 10px;font-size:13.5px;line-height:1.55;color:#334155;">${escapeHtml(input.intro)}</p>
                    ${input.secondaryText ? `<p style="margin:0 0 6px;font-size:13.5px;line-height:1.55;color:#334155;">${escapeHtml(input.secondaryText)}</p>` : ''}
                    ${ctaHtml ? ctaHtml.replace('style="margin:18px 0 4px;"', 'class="nc-cta-wrap" style="margin:18px 0 4px;"').replace('style="display:inline-block;', 'class="nc-cta-btn" style="display:inline-block;') : ''}
                  </td>
                  ${heroRightHtml}
                </tr>
              </table>

              ${detailsHtml}
              ${featuresHtml}
              ${noteHtml}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 8px;">
                <tr>
                  <td style="font-size:12.5px;color:#334155;line-height:1.6;">
                    Need any assistance? We&#39;re here for you.<br>
                    <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}" style="color:#1EA12B;font-weight:700;text-decoration:none;">&#9993;&nbsp; ${escapeHtml(env.SUPPORT_EMAIL)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;font-size:13px;color:#334155;line-height:1.5;">
                    Warm regards,<br>
                    <strong style="color:#0F294A;font-size:14px;">${escapeHtml(input.signoff || 'Nayacura Care Team')}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <img src="cid:email-footer-wave" alt="" width="650" style="display:block;width:100%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td class="nc-footer-text" bgcolor="#0C2F58" style="background:#0C2F58;padding:6px 20px 18px;text-align:center;color:#E2E8F0;font-size:11.5px;font-weight:600;">
              Secure &amp; Confidential &nbsp;&bull;&nbsp; Verified Experts &nbsp;&bull;&nbsp; Holistic Sexual Wellness
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function send(to: string, subject: string, text: string, template: string, html?: string): Promise<MailSendResult> {
  const attachments = collectInlineAttachments(html);
  const transport = getTransporter();
  if (!transport) {
    logger.info('email.skipped_demo', { template, reason: 'SMTP_NOT_CONFIGURED' });
    if (!env.isProduction && !env.isTest) {
      try {
        const testTransport = await getEtherealTransporter();
        const previewResult = await testTransport.sendMail({ from: env.SMTP_FROM, to, subject, text, html, attachments });
        const previewUrl = nodemailer.getTestMessageUrl(previewResult) || undefined;
        logger.info('email.ethereal_preview', { template, previewUrl });
        return { delivered: false, mode: 'ethereal', reason: 'SMTP_NOT_CONFIGURED', previewUrl };
      } catch (err) {
        logger.warn('email.ethereal_failed', {
          template,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { delivered: false, mode: 'skipped', reason: 'SMTP_NOT_CONFIGURED' };
  }
  try {
    const result = await transport.sendMail({ from: env.SMTP_FROM, to, subject, text, html, attachments });
    if (!result.accepted?.length) {
      logger.warn('email.recipient_not_accepted', { template });
      return { delivered: false, mode: 'failed', reason: 'RECIPIENT_NOT_ACCEPTED' };
    }
    logger.info('email.sent', { template, messageId: result.messageId });
    return { delivered: true, mode: 'smtp' };
  } catch (error) {
    logger.warn('email.failed', {
      template,
      error: error instanceof Error ? error.message : String(error),
    });
    return { delivered: false, mode: 'failed', reason: 'SMTP_DELIVERY_FAILED' };
  }
}

/**
 * Transactional notifications deliberately exclude the consultation reason,
 * clinical notes, prescriptions and any AI conversation content.
 */
export async function sendBookingConfirmation(input: {
  to: string;
  bookingId: string;
  doctorName: string;
  startAt: Date;
  timezone: string;
  mode: string;
}) {
  const when = formatDateTime(input.startAt.toISOString(), input.timezone);
  const modeLabel = input.mode === 'ONLINE' ? 'Secure video consultation' : 'In-person consultation';
  const html = renderBrandEmailCard({
    badge: 'BOOKING CONFIRMED',
    titlePrefix: 'Appointment ',
    titleAccent: 'Confirmed',
    greeting: 'Hello,',
    intro: 'Your private Nayacura consultation has been scheduled. Sign in to your dashboard to join or manage your booking.',
    details: [
      { label: 'Booking Reference', value: input.bookingId, accent: true },
      { label: 'Clinician', value: input.doctorName },
      { label: 'Date & Time', value: `${when} (${input.timezone})` },
      { label: 'Consultation Mode', value: modeLabel },
    ],
    showHeroDevices: true,
    cta: { label: 'Open My Dashboard', url: `${env.APP_URL}/patient-dashboard` },
    note: `No clinical details are included in this email for your privacy. Need help? Contact ${env.SUPPORT_EMAIL}.`,
  });
  return send(
    input.to,
    `Nayacura booking confirmed — ${input.bookingId}`,
    `Your Nayacura appointment is confirmed.\n\nBooking reference: ${input.bookingId}\nClinician: ${input.doctorName}\nWhen: ${when} (${input.timezone})\nFormat: ${modeLabel}\n\nTo view joining instructions or manage this booking, sign in to your private dashboard.\n\nThis message does not include clinical details. If you did not make this booking, contact ${env.SUPPORT_EMAIL}.`,
    'booking_confirmation',
    html,
  );
}

export async function sendBookingCancellation(input: {
  to: string;
  bookingId: string;
  doctorName: string;
  startAt: Date;
  timezone: string;
}) {
  const when = formatDateTime(input.startAt.toISOString(), input.timezone);
  const html = renderBrandEmailCard({
    badge: 'BOOKING CANCELLED',
    titlePrefix: 'Appointment ',
    titleAccent: 'Cancelled',
    greeting: 'Hello,',
    intro: `Your appointment with ${input.doctorName} on ${when} has been cancelled.`,
    details: [
      { label: 'Booking Reference', value: input.bookingId },
      { label: 'Clinician', value: input.doctorName },
      { label: 'Scheduled Time', value: when },
    ],
    showHeroDevices: false,
    cta: { label: 'Book Another Slot', url: `${env.APP_URL}/consult-sexologist` },
    note: `No clinical details are included in this email. Questions? Write to ${env.SUPPORT_EMAIL}.`,
  });
  return send(
    input.to,
    `Nayacura booking cancelled — ${input.bookingId}`,
    `Your appointment with ${input.doctorName} on ${when} has been cancelled.\n\nBooking reference: ${input.bookingId}\n\nNo clinical details are included in this message.`,
    'booking_cancellation',
    html,
  );
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  const html = renderBrandEmailCard({
    badge: 'SECURITY',
    titlePrefix: 'Reset Your ',
    titleAccent: 'Password',
    greeting: 'Hello,',
    intro: 'A password reset was requested for your Nayacura account. Click the button below within 30 minutes to set a new password.',
    details: [{ label: 'Account Email', value: to }],
    showHeroDevices: false,
    cta: { label: 'Reset Password', url: resetUrl },
    note: 'If you did not request this password reset, you can safely ignore this message. The link expires automatically.',
  });
  return send(
    to,
    'Reset your Nayacura password',
    `A password reset was requested for this email address.\n\nOpen this link within 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore the message. The link expires automatically.`,
    'password_reset',
    html,
  );
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const html = renderBrandEmailCard({
    badge: 'EMAIL VERIFICATION',
    titlePrefix: 'Verify Your ',
    titleAccent: 'Email',
    greeting: 'Hello,',
    intro: 'Please confirm your email address within 24 hours to activate full account recovery and notifications.',
    details: [{ label: 'Registered Email', value: to }],
    showHeroDevices: false,
    cta: { label: 'Verify Email Address', url: verifyUrl },
    note: 'If you did not create this account, you can ignore this email.',
  });
  return send(
    to,
    'Verify your Nayacura email',
    `Welcome to Nayacura.\n\nPlease verify your email address within 24 hours:\n${verifyUrl}\n\nIf you did not create an account, you can ignore this message.`,
    'email_verification',
    html,
  );
}

export async function sendDoctorApplicationReceived(to: string, name?: string, applicationId?: string) {
  const greeting = name ? `Dear ${name},` : 'Hello,';
  const html = renderBrandEmailCard({
    badge: 'APPLICATION RECEIVED',
    titlePrefix: 'Welcome to ',
    titleAccent: 'Nayacura!',
    greeting,
    intro: 'Thank you for applying to join Nayacura as a verified sexual & intimate wellness clinician.',
    secondaryText: 'Our clinical governance team is verifying your council registration. Once approved by the admin, your User ID (Doctor ID) and password will be sent to this email from hello@nayacura.com.',
    details: [
      ...(applicationId ? [{ label: 'Application ID', value: applicationId, accent: true }] : []),
      { label: 'Registered Email', value: to },
      { label: 'Verification Status', value: 'Pending Admin Approval', accent: true },
    ],
    showHeroDevices: true,
    showFeatures: false,
    cta: { label: 'Doctor Sign In Page', url: `${env.APP_URL}/doctor-login` },
    signoff: 'Nayacura Clinician Onboarding',
  });
  return send(
    to,
    'Welcome to Nayacura — Clinician Application Received',
    `${greeting}\n\nWelcome to Nayacura! Thank you for applying to join our confidential sexual wellness platform.\n\n${applicationId ? `Application ID: ${applicationId}\n` : ''}Your application is pending admin verification. Once approved, your User ID (Doctor ID), login email, and temporary password will be sent to ${to} from hello@nayacura.com.\n\nWarm regards,\nNayacura Clinician Onboarding (hello@nayacura.com)`,
    'doctor_application_received',
    html,
  );
}

export async function sendPatientWelcomeEmail(to: string, name: string) {
  const html = renderBrandEmailCard({
    badge: 'ACCOUNT ACTIVATED',
    titlePrefix: 'Welcome to ',
    titleAccent: 'Nayacura!',
    greeting: `Dear ${name},`,
    intro: 'Your confidential patient account has been created successfully and is now ready to use.',
    secondaryText: 'You can now access expert consultations, get sexual health guidance, book lab tests, and manage your wellness journey—all in one place.',
    showHeroDevices: true,
    showFeatures: true,
    cta: { label: 'Go to My Account', url: `${env.APP_URL}/patient-dashboard` },
    signoff: 'Nayacura Care Team',
  });
  return send(
    to,
    'Welcome to Nayacura — Your Confidential Wellness Space',
    `Dear ${name},\n\nWelcome to Nayacura! Your confidential patient account (${to}) is ready.\n\nYou can now book private consultations with verified sexologists, ask anonymous sexual health doubts, order discreet at-home lab tests, and track plain-box wellness orders.\n\nIf you need help at any time, reach us at ${env.SUPPORT_EMAIL}.\n\nWarm regards,\nNayacura Care Team (hello@nayacura.com)`,
    'patient_welcome',
    html,
  );
}

export async function sendDoctorApproval(to: string, setupUrl: string) {
  const html = renderBrandEmailCard({
    badge: 'CLINICIAN APPROVED',
    titlePrefix: 'Account ',
    titleAccent: 'Approved!',
    greeting: 'Hello,',
    intro: 'Our clinical governance team has approved your application. Set your password within 24 hours to activate your clinician console.',
    details: [{ label: 'Login Email', value: to, accent: true }],
    showHeroDevices: true,
    cta: { label: 'Set Password & Sign In', url: setupUrl },
    signoff: 'Nayacura Clinician Onboarding',
  });
  return send(
    to,
    'Your Nayacura clinician application was approved',
    `Your clinician application has been approved.\n\nLogin email: ${to}\n\nSet your password using this single-use link within 24 hours:\n${setupUrl}\n\nAfter setting your password, sign in to the Clinician Portal with your login email.\n\nWarm regards,\nNayacura Clinician Onboarding (hello@nayacura.com)`,
    'doctor_application_approved',
    html,
  );
}

export async function sendWelcomeEmail(to: string) {
  const html = renderBrandEmailCard({
    badge: 'WELLNESS UPDATES',
    titlePrefix: 'Welcome to ',
    titleAccent: 'Nayacura!',
    greeting: 'Hello,',
    intro: 'Thanks for connecting with Nayacura. Explore our confidential sexual wellness guides, anonymous Q&A, and verified clinical consultations at your own pace.',
    showHeroDevices: true,
    cta: { label: 'Explore Nayacura', url: env.APP_URL },
    note: 'If you did not request this welcome email, you can safely ignore it.',
  });
  return send(
    to,
    'Welcome to Nayacura',
    'Welcome to Nayacura!\n\nThanks for stopping by. You can explore our wellness resources and learn about consultation options at your own pace.\n\nIf you did not request this welcome email, you can ignore it.\n\nThe Nayacura team',
    'newsletter_welcome',
    html,
  );
}

export async function sendDoctorCredentialsEmail(input: {
  to: string;
  name: string;
  doctorId: string;
  password: string;
  regNo?: string;
}) {
  const regLine = input.regNo ? ` (${input.regNo})` : '';
  const approvalHtml = renderBrandEmailCard({
    badge: 'APPLICATION APPROVED',
    titlePrefix: 'Welcome to ',
    titleAccent: 'Nayacura!',
    greeting: `Dear ${input.name},`,
    intro: `Our clinical governance team has verified your council registration${regLine} and approved your application.`,
    secondaryText: 'Your private clinician suite is now active. A separate email containing your User ID, login email, and temporary password follows right after this message.',
    details: [
      { label: 'Clinician', value: input.name },
      ...(input.regNo ? [{ label: 'Registration No.', value: input.regNo }] : []),
      { label: 'Status', value: 'Verified & Active', accent: true },
    ],
    showHeroDevices: true,
    showFeatures: false,
    signoff: 'Nayacura Clinical Governance Team',
  });
  await send(
    input.to,
    'Welcome & Approval — Thank you for joining Nayacura',
    `Dear ${input.name},\n\nThank you for applying to practise on Nayacura. Our clinical governance team has verified your council registration${regLine} and approved your application.\n\nA separate email with your login credentials follows this message.\n\nWarm regards,\nNayacura Clinical Governance Team (hello@nayacura.com)`,
    'doctor_approval_welcome',
    approvalHtml,
  );

  const credentialsHtml = renderBrandEmailCard({
    badge: 'CREDENTIALS ISSUED',
    titlePrefix: 'Clinician ',
    titleAccent: 'Login Credentials',
    greeting: `Dear ${input.name},`,
    intro: 'Your Nayacura clinician account is approved and ready. Sign in using either your User ID (Doctor ID) or Login Email along with your Temporary Password below.',
    details: [
      { label: 'User ID (Doctor ID)', value: input.doctorId, accent: true },
      { label: 'Login Email', value: input.to },
      { label: 'Temporary Password', value: input.password, accent: true },
    ],
    showHeroDevices: false,
    showFeatures: false,
    cta: { label: 'Sign In to Doctor Portal', url: `${env.APP_URL}/doctor-login` },
    note: `You can sign in with User ID (${input.doctorId}) or Login Email (${input.to}). Please update your password from Profile & Security after your first sign in. Queries? Write to ${env.SUPPORT_EMAIL}.`,
    signoff: 'Nayacura Clinician Onboarding',
  });
  return send(
    input.to,
    'Your Nayacura clinician User ID, login email & password',
    `Dear ${input.name},\n\nYour Nayacura clinician account is approved and ready.\n\nUser ID (Doctor ID): ${input.doctorId}\nLogin Email: ${input.to}\nTemporary Password: ${input.password}\n\nSign in at ${env.APP_URL}/doctor-login using your User ID or Login Email and Temporary Password, and change your password from Profile & Security after your first login.\n\nWarm regards,\nNayacura Clinician Onboarding (hello@nayacura.com)`,
    'doctor_approval_credentials',
    credentialsHtml,
  );
}

export async function sendSupportAcknowledgement(input: {
  to: string;
  reference: string;
}) {
  const html = renderBrandEmailCard({
    badge: '24x7 CONFIDENTIAL SUPPORT',
    titlePrefix: 'Support Request ',
    titleAccent: 'Received',
    greeting: 'Hello,',
    intro: 'We have received your support message. Our confidential care desk will review your request and respond shortly.',
    details: [{ label: 'Ticket Reference', value: input.reference, accent: true }],
    showHeroDevices: false,
    note: 'Please do not send sensitive clinical details or identity documents over email. For urgent medical emergencies, contact local emergency services.',
  });
  return send(
    input.to,
    `Nayacura support request received — ${input.reference}`,
    `We have received your support request.\n\nReference: ${input.reference}\n\nPlease do not send clinical details or identity documents by email.\n\nIf this is an emergency, contact local emergency services immediately.`,
    'support_acknowledgement',
    html,
  );
}
