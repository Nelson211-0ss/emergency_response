const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emergency = sequelize.define('Emergency', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'emergency_type'
    },
    reporterName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'reporter_name'
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_number'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.JSON,
        allowNull: false
    },
    mediaUrls: {
        type: DataTypes.JSON,
        field: 'media_urls',
        defaultValue: []
    },
    additionalNotes: {
        type: DataTypes.TEXT,
        field: 'additional_notes'
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'resolved'),
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
    }
}, {
    tableName: 'emergencies',
    underscored: true,
    timestamps: true
});

module.exports = Emergency;