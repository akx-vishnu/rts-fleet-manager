import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
    try {
        console.log('Dropping all tables...');

        // Drop all tables in the public schema
        await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);

        console.log('✅ Database reset successfully!');
        console.log('Next steps:');
        console.log('1. Run: npx drizzle-kit migrate');
        console.log('2. Run: npm run seed');
    } catch (err) {
        console.error('❌ Reset failed:', err);
    } finally {
        await pool.end();
    }
}

resetDatabase();
