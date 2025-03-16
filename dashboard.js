import notificationService from './notification-service.js';

// Initialize Leaflet map
let map = L.map('emergencyMap').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Current user information (mock)
const currentUser = {
    id: 'officer123',
    name: 'Officer John Doe',
    role: 'responder',
    region: 'downtown'
};

// Set user preferences for notifications
notificationService.setUserPreferences(currentUser.id, {
    region: currentUser.region,
    priority: ['critical', 'high'],
    channels: ['push', 'email'],
    role: currentUser.role
});

// Subscribe to notifications
notificationService.subscribe(currentUser.id, (notification) => {
    // Update dashboard UI with new notification
    updateDashboardWithNotification(notification);
    // Update notification badge
    updateNotificationBadge();
});

// Function to update dashboard with new notification
function updateDashboardWithNotification(notification) {
    // Add to live feed
    addToLiveFeed({
        time: 'Just now',
        title: notification.title,
        location: notification.location,
        priority: notification.priority,
        type: notification.type
    });

    // Add marker to map if location is provided
    if (notification.coordinates) {
        addEmergencyMarker(notification);
    }

    // Update statistics
    updateStatistics();
}

// Function to add emergency marker to map
function addEmergencyMarker(emergency) {
    const marker = L.marker([emergency.coordinates.lat, emergency.coordinates.lng])
        .bindPopup(`<b>${emergency.title}</b><br>Priority: ${emergency.priority}`)
        .addTo(map);

    // Center map on new emergency for critical incidents
    if (emergency.priority === 'critical') {
        map.setView([emergency.coordinates.lat, emergency.coordinates.lng], 13);
    }
}

// Function to add emergency to live feed
function addToLiveFeed(emergency) {
    const feedContainer = document.querySelector('.feed-container');
    const feedItem = document.createElement('div');
    feedItem.className = `feed-item ${emergency.priority === 'critical' ? 'urgent' : ''}`;
    feedItem.innerHTML = `
        <div class="feed-time">${emergency.time}</div>
        <div class="feed-content">
            <h3>${emergency.title}</h3>
            <p>${emergency.location}</p>
            <div class="feed-tags">
                <span class="tag ${emergency.priority}">${emergency.priority}</span>
                <span class="tag type">${emergency.type}</span>
            </div>
        </div>
        <button class="action-btn">Respond</button>
    `;

    feedContainer.insertBefore(feedItem, feedContainer.firstChild);
    if (feedContainer.children.length > 5) {
        feedContainer.lastChild.remove();
    }

    // Add event listener to new action button
    feedItem.querySelector('.action-btn').addEventListener('click', (e) => {
        const emergency = feedItem.querySelector('.feed-content h3').textContent;
        handleEmergencyResponse(emergency);
    });
}

// Function to handle emergency response
function handleEmergencyResponse(emergency) {
    // Create response notification
    const responseNotification = {
        id: Date.now().toString(),
        title: `Response: ${emergency}`,
        description: `Officer ${currentUser.name} responding to ${emergency}`,
        priority: 'high',
        type: 'response',
        targetRole: 'dispatcher',
        region: currentUser.region,
        timestamp: new Date(),
        coordinates: null // Add actual coordinates when available
    };

    // Send response notification
    notificationService.sendNotification(responseNotification);
    alert(`Responding to: ${emergency}`);
}

// Function to update notification badge
function updateNotificationBadge() {
    const unreadCount = notificationService.getNotifications(currentUser.id)
        .filter(n => !n.readBy || !n.readBy.has(currentUser.id))
        .length;

    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// Handle map control buttons
document.querySelectorAll('.map-controls .control-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.map-controls .control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        filterMapMarkers(button.textContent.toLowerCase());
    });
});

// Function to filter map markers
function filterMapMarkers(filter) {
    // Implementation depends on how markers are stored and managed
    console.log('Filtering markers by:', filter);
}

// Handle feed filter
document.querySelector('.feed-filter').addEventListener('change', (e) => {
    const filter = e.target.value;
    filterLiveFeed(filter);
});

// Function to filter live feed
function filterLiveFeed(filter) {
    const feedItems = document.querySelectorAll('.feed-item');
    feedItems.forEach(item => {
        const type = item.querySelector('.tag.type').textContent.toLowerCase();
        item.style.display = (filter === 'all' || type === filter) ? 'flex' : 'none';
    });
}

// Handle refresh button
document.querySelector('.refresh-btn').addEventListener('click', () => {
    updateDashboard();
});

// Function to update dashboard
function updateDashboard() {
    updateStatistics();
    updateCharts();
    // Fetch and display latest notifications
    const notifications = notificationService.getNotifications(currentUser.id);
    notifications.forEach(updateDashboardWithNotification);
}

// Function to update statistics
function updateStatistics() {
    // Implementation for updating dashboard statistics
    console.log('Updating statistics...');
}

// Function to update charts
function updateCharts() {
    // Implementation for updating dashboard charts
    console.log('Updating charts...');
}

// Initialize dashboard
updateDashboard();

// Simulate incoming emergencies (for demonstration)
setInterval(() => {
    const mockEmergency = {
        id: Date.now().toString(),
        title: 'New Emergency Alert',
        description: 'Emergency situation reported in downtown area',
        location: 'Central Park Area',
        priority: Math.random() > 0.5 ? 'critical' : 'high',
        type: 'Police',
        targetRole: 'responder',
        region: 'downtown',
        timestamp: new Date(),
        coordinates: {
            lat: 51.505 + (Math.random() - 0.5) * 0.02,
            lng: -0.09 + (Math.random() - 0.5) * 0.02
        }
    };

    notificationService.sendNotification(mockEmergency);
}, 30000); // New emergency every 30 seconds 