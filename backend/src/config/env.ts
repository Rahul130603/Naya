import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod/v3';

function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'backend', '.env'),
    resolve(__dirname, '../../.env'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      // Node 20.12+ built-in .env parser; avoids an extra runtime dependency.
      process.loadEnvFile(file);
    } catch {
      // Environment may be supplied by the platform instead.
    }
  }
}

loadEnvFiles();

const bool = (fallback: 'true' | 'false') =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined ? fallback === 'true' : value === 'true'));

const numberFromEnv = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : fallback))
    .pipe(z.number().finite());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numberFromEnv(5000),
  APP_URL: z.string().default('http://localhost:4455'),
  CORS_ORIGIN: z.string().default('http://localhost:4455'),
  DATABASE_URL: z.string().min(1),
  SESSION_TTL_DAYS: numberFromEnv(7),
  DATA_ENCRYPTION_KEY: z.string().optional(),
  DEMO_MODE: bool('false'),
  TAX_PERCENT: numberFromEnv(18),
  COOKIE_SECURE: bool('false'),
  TRUST_PROXY: z.string().default('0'),
  UPLOAD_DIR: z.string().default('uploads'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  PIPER_PYTHON: z.string().trim().optional(),
  PIPER_TAMIL_MODEL: z.string().trim().optional(),
  PIPER_ENGLISH_MODEL: z.string().trim().optional(),
  LLM_API_KEY: z.string().optional(),
  SGAI_API_KEY: z.string().optional(),
  SGAI_ALLOWED_HOSTS: z.string().optional(),
  NAYA_KNOWLEDGE_FILE: z.string().trim().optional(),
  LLM_BASE_URL: z.string().default('https://api.openai.com/v1'),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
  TWILIO_ACCOUNT_SID: z.string().trim().optional(),
  TWILIO_AUTH_TOKEN: z.string().trim().optional(),
  TWILIO_SMS_FROM: z.string().trim().optional(),
  TWILIO_WHATSAPP_FROM: z.string().trim().optional(),
  TWILIO_API_BASE: z.string().trim().default('https://api.twilio.com'),
  FAST2SMS_API_KEY: z.string().trim().optional(),
  FAST2SMS_ROUTE: z.string().trim().default('q'),
  WHATSAPP_CLOUD_TOKEN: z.string().trim().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().trim().optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().trim().optional(),
  WHATSAPP_TEMPLATE_LANG: z.string().trim().default('en'),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: numberFromEnv(587),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM: z.string().trim().default('Nayacura <hello@nayacura.com>'),
  SUPPORT_EMAIL: z.string().trim().default('support@nayacura.com'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

const raw = parsed.data;
const isProduction = raw.NODE_ENV === 'production';

if (raw.NODE_ENV !== 'test' && !raw.DATA_ENCRYPTION_KEY) {
  throw new Error('DATA_ENCRYPTION_KEY is required. Run npm run local:db for local setup.');
}
if (isProduction && (raw.DEMO_MODE || !raw.COOKIE_SECURE)) {
  throw new Error('Production requires DEMO_MODE=false and COOKIE_SECURE=true.');
}
if (raw.NODE_ENV !== 'test' && !/^postgres(ql)?:/.test(raw.DATABASE_URL)) {
  throw new Error('PostgreSQL DATABASE_URL is required.');
}

export const env = {
  ...raw,
  isProduction,
  isTest: raw.NODE_ENV === 'test',
  isDemo: raw.DEMO_MODE,
  razorpayConfigured: Boolean(raw.RAZORPAY_KEY_ID && raw.RAZORPAY_KEY_SECRET),
  livekitConfigured: Boolean(
    raw.LIVEKIT_URL && raw.LIVEKIT_API_KEY && raw.LIVEKIT_API_SECRET,
  ),
  llmConfigured: Boolean(raw.LLM_API_KEY),
  smtpConfigured: Boolean(raw.SMTP_HOST && raw.SMTP_USER && raw.SMTP_PASS),
  // Fast2SMS (India) or Twilio provides SMS delivery.
  fast2smsConfigured: Boolean(raw.FAST2SMS_API_KEY),
  // Meta WhatsApp Cloud API (or Twilio) provides WhatsApp delivery.
  metaWhatsappConfigured: Boolean(raw.WHATSAPP_CLOUD_TOKEN && raw.WHATSAPP_PHONE_NUMBER_ID),
  smsConfigured: Boolean(
    raw.FAST2SMS_API_KEY || (raw.TWILIO_ACCOUNT_SID && raw.TWILIO_AUTH_TOKEN && raw.TWILIO_SMS_FROM),
  ),
  whatsappConfigured: Boolean(
    (raw.WHATSAPP_CLOUD_TOKEN && raw.WHATSAPP_PHONE_NUMBER_ID) ||
      (raw.TWILIO_ACCOUNT_SID && raw.TWILIO_AUTH_TOKEN && raw.TWILIO_WHATSAPP_FROM),
  ),
  encryptionKey: raw.DATA_ENCRYPTION_KEY || 'nayacura-development-only-key-do-not-use-in-production',
};

export type AppEnv = typeof env;
