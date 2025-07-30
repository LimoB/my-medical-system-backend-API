import 'dotenv/config';
import { Pool } from '@neondatabase/serverless'; // Neon WebSocket-based pool
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from '@/drizzle/schema';
import * as relations from '@/drizzle/relationships'; // ✅ Import your relations

// Merge tables and relations into one schema object
const dbSchema = {
  ...schema,
  ...relations,
};

// Initialize Neon pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Initialize Drizzle with schema + relations
const db = drizzle(pool, { schema: dbSchema, logger: true });

export default db;