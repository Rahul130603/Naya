import EmbeddedPostgres from '../backend/node_modules/embedded-postgres/dist/index.js';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const local = resolve(root, '.local');
mkdirSync(local, { recursive: true });
const configPath = resolve(local, 'postgres.json');
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf8'))
  : { user: 'nayacura_local', password: randomBytes(32).toString('hex'), port: 55432, database: 'nayacura' };
if (!existsSync(configPath)) writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
const databaseDir = resolve(local, 'postgres');
const postgres = new EmbeddedPostgres({
  databaseDir, user: config.user, password: config.password, port: config.port,
  authMethod: 'scram-sha-256', persistent: true,
  postgresFlags: ['-h', '127.0.0.1'], initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {}, onError: (error) => { if (String(error).includes('FATAL')) console.error('PostgreSQL startup failed. Check the local database process.'); },
});
if (!existsSync(resolve(databaseDir, 'PG_VERSION'))) await postgres.initialise();
// Never replace or reset an existing cluster.
await postgres.start();
const client = postgres.getPgClient('postgres', '127.0.0.1');
await client.connect();
for (const name of [config.database, `${config.database}_test`]) {
  if (!/^[a-z_]+$/.test(name)) throw new Error('Invalid local database name');
  const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (!found.rowCount) await client.query(`CREATE DATABASE "${name}"`);
}
await client.end();
const envPath = resolve(root, 'backend/.env');
let contents = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
if (contents && !existsSync(resolve(local, 'backend-env.original'))) {
  writeFileSync(resolve(local, 'backend-env.original'), contents, { mode: 0o600 });
}
const defaults = {
  DATABASE_URL: `postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/${config.database}?schema=public`,
  PORT: '5000', APP_URL: 'http://localhost:4455', CORS_ORIGIN: 'http://localhost:4455',
  DEMO_MODE: 'false', COOKIE_SECURE: 'false',
};
if (!/^DATA_ENCRYPTION_KEY=.+$/m.test(contents)) defaults.DATA_ENCRYPTION_KEY = randomBytes(48).toString('base64url');
for (const [key, value] of Object.entries(defaults)) {
  const line = `${key}=${value}`;
  contents = new RegExp(`^${key}=.*$`, 'm').test(contents)
    ? contents.replace(new RegExp(`^${key}=.*$`, 'm'), line)
    : `${contents.trimEnd()}\n${line}\n`;
}
writeFileSync(envPath, contents.trimStart(), { mode: 0o600 });
console.log(`Local PostgreSQL ready on 127.0.0.1:${config.port}. Credentials remain in ignored local files.`);
console.log('Keep this terminal running. Stop with Ctrl+C; database files are retained.');
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  if (stopping) return;
  stopping = true;
  await postgres.stop();
  process.exit(0);
});
await new Promise(() => {});
