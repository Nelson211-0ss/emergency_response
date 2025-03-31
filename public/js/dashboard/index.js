import { fetchEmergencies } from './api.js';
import { updateCharts, initializeChartResizing } from './charts.js';
import { initializeMap, updateEmergencyMap } from './map.js';
import { initializeWebSocket } from './notifications.js';
import { viewEmergencyDetails, updateEmergencyStatus, closeEmergencyModal } from './emergencyDetails.js';
import { updateOverviewCards, updateLiveFeed, filterEmergencies } from './liveFeed.js';

// Global state
let emergencies = [];

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Fetch initial data
        emergencies = await fetchEmergencies();
        
        // Update all dashboard components
        updateDashboard();
        
        // Set up periodic refresh
        setInterval(refreshDashboard, 30000);
        
        // Initialize components
        initializeMap();
        initializeChartResizing();
        setupEventListeners();
        
        // Set up WebSocket
        initializeWebSocket(refreshDashboard);
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Update all dashboard components
function updateDashboard() {
    updateOverviewCards(emergencies);
    updateEmergencyMap(emergencies);
    updateLiveFeed(emergencies);
    updateCharts(emergencies);
}

// Refresh dashboard data
async function refreshDashboard() {
    try {
        emergencies = await fetchEmergencies();
        updateDashboard();
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Type filter
    const feedFilter = document.querySelector('.feed-filter');
    if (feedFilter) {
        feedFilter.addEventListener('change', (e) => {
            const filtered = filterEmergencies(emergencies, e.target.value);
            updateEmergencyMap(filtered);
        });
    }

    // Status filter
    const mapControls = document.querySelector('.map-controls');
    if (mapControls) {
        mapControls.addEventListener('click', (e) => {
            if (e.target.classList.contains('control-btn')) {
                const status = e.target.dataset.status;
                document.querySelectorAll('.control-btn').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                const filtered = filterEmergencies(emergencies, 'all', status);
                updateEmergencyMap(filtered);
            }
        });
    }
}

// Make functions available globally for onclick handlers
window.viewEmergencyDetails = viewEmergencyDetails;
window.updateEmergencyStatus = updateEmergencyStatus;
window.closeEmergencyModal = closeEmergencyModal;
window.refreshDashboard = refreshDashboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);