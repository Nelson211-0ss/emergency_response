require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

async function resetAdminPassword() {
    try {
        // Create a manual connection
        await sequelize.authenticate();
        console.log('Connected to database');
        
        // Use raw SQL to update the password directly
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        // Update the admin user's password directly in the database
        const [results] = await sequelize.query(
            "UPDATE Users SET password = ? WHERE email = 'admin@emergencyresponse.com'",
            { replacements: [hashedPassword] }
        );
        
        if (results.affectedRows === 0) {
            console.log('Admin user not found. Creating new admin user...');
            
            // Create admin if it doesn't exist
            await sequelize.query(
                "INSERT INTO Users (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
                { 
                    replacements: [
                        'Admin', 
                        'admin@emergencyresponse.com', 
                        hashedPassword, 
                        'admin'
                    ] 
                }
            );
            console.log('Admin user created');
        } else {
            console.log('Admin password updated successfully');
        }
        
        console.log('New password hash:', hashedPassword);
        console.log('Test login with:');
        console.log('Email: admin@emergencyresponse.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        await sequelize.close();
    }
}

resetAdminPassword();
