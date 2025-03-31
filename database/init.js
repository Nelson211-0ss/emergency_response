require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        // Create initial connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS emergency_response');
        
        // Switch to the database
        await connection.query('USE emergency_response');

        // Disable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop existing tables
        await connection.query('DROP TABLE IF EXISTS emergency_assignments');
        await connection.query('DROP TABLE IF EXISTS emergencies');
        await connection.query('DROP TABLE IF EXISTS users');

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create Users table
        const createUsersTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.query(createUsersTableSQL);
        console.log('Users table created successfully');

        // Create Emergencies table with correct column names
        const createEmergenciesTableSQL = `
            CREATE TABLE IF NOT EXISTS emergencies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                emergency_type VARCHAR(255) NOT NULL,
                reporter_name VARCHAR(255) NOT NULL,
                contact_number VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                location JSON NOT NULL,
                media_urls JSON,
                additional_notes TEXT,
                status ENUM('pending', 'active', 'resolved') DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_priority (priority),
                INDEX idx_type (emergency_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.query(createEmergenciesTableSQL);
        console.log('Emergencies table created successfully');


        await connection.end();
        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Database initialization failed:', error);
        console.error('Detailed error:', error.message);
        process.exit(1);
    }
}

initializeDatabase();
