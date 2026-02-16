const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'rts_fleet_db',
    password: 'root',
    port: 5432,
});

async function updatePassword() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password123', salt);

        // Update Admin
        const resAdmin = await client.query(
            `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email`,
            [hash, 'admin@rts.com']
        );
        if (resAdmin.rowCount > 0) {
            console.log('✅ Admin password updated.');
        } else {
            console.log('⚠️ Admin user not found.');
        }

        // Update Driver
        const resDriver = await client.query(
            `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email`,
            [hash, 'driver@rts.com']
        );
        if (resDriver.rowCount > 0) {
            console.log('✅ Driver password updated.');
        } else {
            console.log('⚠️ Driver user not found.');
        }

    } catch (err) {
        console.error('❌ Error updating passwords:', err);
    } finally {
        await client.end();
    }
}

updatePassword();
