import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/engagepod.db';

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database with schema
const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
