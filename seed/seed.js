'use strict';

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const dotenvResult = require('dotenv').config({ path: envPath });

console.log('[seed] cwd:', process.cwd());
console.log('[seed] envPath:', envPath, '— exists:', fs.existsSync(envPath));
console.log('[seed] dotenv parsed keys:', dotenvResult.parsed ? Object.keys(dotenvResult.parsed) : '(none)');
console.log('[seed] DB_HOST:', process.env.DB_HOST);
console.log('[seed] DB_USER:', process.env.DB_USER);
console.log('[seed] DB_NAME:', process.env.DB_NAME);
console.log('[seed] DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
    });

    console.log('[seed] Connected to database');

    // Create admins table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[seed] Table "admins" OK');

    // Create refresh_tokens table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        admin_id INT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[seed] Table "refresh_tokens" OK');

    // Create settings table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`value\` TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[seed] Table "settings" OK');

    // Create articles table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        cover_image VARCHAR(500),
        published TINYINT(1) DEFAULT 0,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[seed] Table "articles" OK');

    // Create admin user if credentials provided
    if (emailArg && passwordArg) {
      const email = emailArg.toLowerCase().trim();
      const passwordHash = await bcrypt.hash(passwordArg, 12);

      await conn.execute(
        'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
        [email, passwordHash, passwordHash]
      );

      console.log(`[seed] Admin user created/updated: ${email}`);
    } else {
      console.log('[seed] No admin credentials provided. Usage: node seed/seed.js <email> <password>');
    }

    console.log('[seed] Done!');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
