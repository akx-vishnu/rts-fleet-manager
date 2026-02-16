import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './src/drizzle/schema';

dotenv.config();

console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2000, // 2 seconds timeout
});

const db = drizzle(pool, { schema });

async function check() {
    try {
        console.log('Connecting to DB...');
        // Simple query to check connection
        const client = await pool.connect();
        console.log('Connected to DB successfully!');
        client.release();

        console.log('Checking Schema...');
        const res = await db.query.users.findMany({ limit: 1 });
        console.log('Schema check successful. found users:', res.length);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

check();
