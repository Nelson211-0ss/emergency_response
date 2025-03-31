const express = require('express');
const router = express.Router();
const Emergency = require('../models/emergency');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/emergency-media');
    },
    filename: (req, file, cb) => {
        const uniquePrefix = uuidv4();
        cb(null, uniquePrefix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// Handle emergency report submission
router.post('/report', upload.array('media', 5), async (req, res) => {
    try {
        const {
            emergencyType,
            reporterName,
            contactNumber,
            description,
            location,
            additionalNotes
        } = req.body;

        // Validate required fields
        if (!emergencyType || !reporterName || !contactNumber || !description || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Process uploaded files
        const mediaUrls = req.files ? req.files.map(file => `/uploads/emergency-media/${file.filename}`) : [];

        // Parse location data
        let locationData;
        try {
            locationData = JSON.parse(location);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid location data format' });
        }

        // Create emergency record
        const emergency = await Emergency.create({
            type: emergencyType,
            reporterName,
            contactNumber,
            description,
            location: locationData,
            mediaUrls,
            additionalNotes,
            status: 'pending',
            priority: determinePriority(description, emergencyType)
        });

        // Notify relevant personnel (implement notification logic here)
        notifyEmergencyPersonnel(emergency);

        res.status(201).json({
            message: 'Emergency reported successfully',
            emergencyId: emergency.id
        });

    } catch (error) {
        console.error('Error reporting emergency:', error);
        res.status(500).json({ error: 'Failed to report emergency' });
    }
});

// Determine emergency priority based on type and description
function determinePriority(description, type) {
    const criticalKeywords = ['life-threatening', 'severe', 'critical', 'dying', 'death', 'fatal', 'urgent'];
    const highKeywords = ['injury', 'accident', 'fire', 'violence', 'weapon', 'bleeding'];
    
    description = description.toLowerCase();
    
    // Check for critical keywords
    if (criticalKeywords.some(keyword => description.includes(keyword))) {
        return 'critical';
    }
    
    // Check for high priority keywords
    if (highKeywords.some(keyword => description.includes(keyword))) {
        return 'high';
    }
    
    // Type-based priority
    switch (type.toLowerCase()) {
        case 'medical':
        case 'fire':
            return 'high';
        case 'police':
            return 'medium';
        case 'disaster':
            return 'critical';
        default:
            return 'medium';
    }
}

// Notify emergency personnel
async function notifyEmergencyPersonnel(emergency) {
    // Implement notification logic here
    // This could include:
    // - WebSocket notifications to admin dashboard
    // - SMS/Email alerts to relevant personnel
    // - Push notifications to mobile devices
    console.log('Emergency notification sent:', emergency.id);
}

// Get all emergencies (with filtering)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/emergencies - Fetching emergencies');
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.type) where.emergency_type = req.query.type; // Using the correct field name from model
        if (req.query.priority) where.priority = req.query.priority;

        console.log('Query parameters:', where);

        const emergencies = await Emergency.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${emergencies.length} emergencies`);
        res.json(emergencies);
    } catch (error) {
        console.error('Error in GET /api/emergencies:', error);
        res.status(500).json({ 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get emergency details
router.get('/:id', async (req, res) => {
    try {
        const emergency = await Emergency.findByPk(req.params.id);
        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }
        res.json(emergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update emergency status
router.patch('/:id', async (req, res) => {
    try {
        const emergency = await Emergency.findByPk(req.params.id);
        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        const { status, priority } = req.body;
        await emergency.update({ 
            status: status || emergency.status,
            priority: priority || emergency.priority
        });

        // Broadcast the update via WebSocket
        if (global.broadcast) {
            global.broadcast({
                type: 'emergency_update',
                emergency: emergency.toJSON()
            });
        }

        res.json(emergency);
    } catch (error) {
        console.error('Error updating emergency:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;