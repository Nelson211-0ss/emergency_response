require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const sequelize = require('../config/database');

async function seedAdmin() {
    try {
        // Make sure the model is fully synced with the right columns
        await sequelize.sync({ alter: true });

        // Check if admin exists
        const adminExists = await User.findOne({
            where: { email: 'admin@emergencyresponse.com' }
        });

        if (!adminExists) {
            // Debugging info
            console.log('Creating admin user...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // First, insert the admin user
            await sequelize.query(
                "INSERT INTO users (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
                { 
                    replacements: [
                        'Admin', 
                        'admin@emergencyresponse.com', 
                        hashedPassword, 
                        'admin'
                    ],
                    type: sequelize.QueryTypes.INSERT
                }
            );

            // Then, fetch the created admin user
            const [admin] = await sequelize.query(
                "SELECT id, email, role FROM users WHERE email = ?",
                {
                    replacements: ['admin@emergencyresponse.com'],
                    type: sequelize.QueryTypes.SELECT
                }
            );
            
            console.log('Admin user created successfully:', admin);
        } else {
            console.log('Admin user already exists:', {
                id: adminExists.id,
                email: adminExists.email,
                role: adminExists.role
            });
        }

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();
