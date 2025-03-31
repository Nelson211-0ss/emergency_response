const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        console.log('Login request:', { email, rememberMe, password });
        
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', { id: user.id, email: user.email, role: user.role });
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? '7d' : '24h' }
        );

        res.json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a secure endpoint to change passwords
router.post('/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update password (will be hashed by the beforeUpdate hook)
        await user.update({ password: newPassword });
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
