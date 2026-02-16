const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default 'postgres' db first
    password: 'root',
    port: 5432,
});

async function createDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'rts_saas'");
        if (res.rowCount === 0) {
            console.log("Database 'rts_saas' not found. Creating...");
            await client.query('CREATE DATABASE rts_saas');
            console.log("✅ Database 'rts_saas' created successfully!");
        } else {
            console.log("ℹ️ Database 'rts_saas' already exists.");
        }
    } catch (err) {
        console.error('❌ Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
