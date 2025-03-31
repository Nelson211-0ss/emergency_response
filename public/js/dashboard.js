// Global variables
let map = null;
let markers = {};
let emergencies = [];

// Fetch emergencies from the server
async function fetchEmergencies() {
    try {
        const response = await fetch('http://localhost:3000/api/emergencies', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch emergencies');
        }

        const data = await response.json();
        emergencies = Array.isArray(data) ? data : [];

        // Update dashboard with new data
        updateOverviewCards();
        updateEmergencyMap();
        updateLiveFeed();
        updateCharts();
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        showNotification({
            type: 'error',
            message: 'Failed to fetch emergency data',
            duration: 5000
        });
    }
}

// Update overview cards with counts
function updateOverviewCards() {
    const cardNumbers = document.querySelectorAll('.card-number');
    if (cardNumbers.length < 3) {
        console.warn('Overview cards not found in the DOM');
        return;
    }

    const activeCount = emergencies.filter(e => e.status === 'active').length;
    const pendingCount = emergencies.filter(e => e.status === 'pending').length;
    const resolvedToday = emergencies.filter(e => {
        const today = new Date().toDateString();
        const emergencyDate = new Date(e.updatedAt).toDateString();
        return e.status === 'resolved' && emergencyDate === today;
    }).length;

    cardNumbers[0].textContent = activeCount;
    cardNumbers[1].textContent = pendingCount;
    cardNumbers[2].textContent = resolvedToday;
}

// Show notification function
function showNotification({ type, message, duration = 3000 }) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container = document.querySelector('.notification-center') || document.body;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Initialize map only if it hasn't been initialized yet
function initializeMap() {
    if (!map) {
        const mapContainer = document.getElementById('emergencyMap');
        // Check if map container exists and doesn't already have a map
        if (mapContainer && !mapContainer._leaflet_id) {
            map = L.map('emergencyMap').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }
    }
}

// Update emergency map with markers
function updateEmergencyMap() {
    // Initialize map if not already initialized
    initializeMap();
    
    if (!map) return; // Exit if map initialization failed
    
    // Clear existing markers
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};

    // Add new markers
    emergencies.forEach(emergency => {
        if (emergency.location && emergency.location.coordinates) {
            const { lat, lng } = emergency.location.coordinates;
            const marker = L.marker([lat, lng])
                .bindPopup(createEmergencyPopup(emergency))
                .addTo(map);
            markers[emergency.id] = marker;
        }
    });

    // Adjust map bounds if there are markers
    if (Object.keys(markers).length > 0) {
        const bounds = Object.values(markers).map(marker => marker.getLatLng());
        map.fitBounds(bounds);
    }
}

// Update live feed with recent emergencies
function updateLiveFeed() {
    const feedContainer = document.querySelector('.feed-container');
    if (!feedContainer) return;

    // Sort emergencies by date, most recent first
    const sortedEmergencies = [...emergencies].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10); // Show only the 10 most recent

    if (sortedEmergencies.length === 0) {
        feedContainer.innerHTML = `
            <div class="feed-empty-state">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>No emergencies to display</p>
                <p class="text-sm">New emergencies will appear here in real-time</p>
            </div>
        `;
        return;
    }

    feedContainer.innerHTML = sortedEmergencies.map(emergency => `
        <div class="feed-item ${emergency.status}" data-id="${emergency.id}">
            <div class="feed-item-header">
                <div class="flex items-center gap-2">
                    <span class="emergency-type ${emergency.type.toLowerCase()}">
                        ${getEmergencyIcon(emergency.type)} ${emergency.type}
                    </span>
                    <span class="priority ${emergency.priority.toLowerCase()}">${emergency.priority}</span>
                </div>
                <span class="emergency-time" title="${new Date(emergency.createdAt).toLocaleString()}">
                    ${formatTimeAgo(emergency.createdAt)}
                </span>
            </div>
            <div class="feed-item-body">
                <p>${emergency.description}</p>
                <div class="text-xs text-gray-500">
                    <i class="fas fa-user mr-1"></i> ${emergency.reporterName}
                    <i class="fas fa-phone ml-3 mr-1"></i> ${formatPhoneNumber(emergency.contactNumber)}
                </div>
                <div class="feed-item-footer">
                    <span class="status ${emergency.status}">${capitalizeFirstLetter(emergency.status)}</span>
                    <div class="feed-item-actions">
                        <button onclick="viewEmergencyDetails(${emergency.id})" class="view-btn">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="updateEmergencyStatus()" class="update-btn">
                            <i class="fas fa-edit"></i> Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add fade-in animation to new items
    document.querySelectorAll('.feed-item').forEach(item => {
        item.style.opacity = '0';
        requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.3s ease-in-out';
            item.style.opacity = '1';
        });
    });
}

// Helper function to get appropriate icon for emergency type
function getEmergencyIcon(type) {
    const icons = {
        'medical': '<i class="fas fa-ambulance"></i>',
        'fire': '<i class="fas fa-fire"></i>',
        'police': '<i class="fas fa-shield-alt"></i>',
        'disaster': '<i class="fas fa-exclamation-triangle"></i>'
    };
    return icons[type.toLowerCase()] || '<i class="fas fa-exclamation-circle"></i>';
}

// Helper function to format phone numbers
function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Filter emergencies based on type and status
function filterEmergencies(type = 'all', status = null) {
    let filtered = [...emergencies];
    
    if (type !== 'all') {
        filtered = filtered.filter(e => e.type.toLowerCase() === type.toLowerCase());
    }
    
    if (status) {
        filtered = filtered.filter(e => e.status === status);
    }
    
    // Update the live feed with filtered emergencies
    const feedContainer = document.querySelector('.feed-container');
    if (feedContainer) {
        feedContainer.innerHTML = filtered
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(emergency => `
                <div class="feed-item ${emergency.status}" data-id="${emergency.id}">
                    <div class="feed-item-header">
                        <span class="emergency-type ${emergency.type.toLowerCase()}">${emergency.type}</span>
                        <span class="emergency-time">${formatTimeAgo(emergency.createdAt)}</span>
                    </div>
                    <div class="feed-item-body">
                        <p>${emergency.description}</p>
                        <div class="feed-item-footer">
                            <span class="status ${emergency.status}">${emergency.status}</span>
                            <span class="priority ${emergency.priority}">${emergency.priority}</span>
                        </div>
                    </div>
                    <div class="feed-item-actions">
                        <button onclick="viewEmergencyDetails(${emergency.id})" class="view-btn">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="updateEmergencyStatus()" class="update-btn">
                            <i class="fas fa-edit"></i> Update
                        </button>
                    </div>
                </div>
            `).join('');
    }
    
    // Update the map with filtered markers
    updateEmergencyMapFiltered(filtered);
}

// Update map with filtered emergencies
function updateEmergencyMapFiltered(filteredEmergencies) {
    if (!map) return;
    
    // Clear existing markers
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};

    // Add filtered markers
    filteredEmergencies.forEach(emergency => {
        if (emergency.location && emergency.location.coordinates) {
            const { lat, lng } = emergency.location.coordinates;
            const marker = L.marker([lat, lng])
                .bindPopup(createEmergencyPopup(emergency))
                .addTo(map);
            markers[emergency.id] = marker;
        }
    });

    // Adjust map bounds if there are markers
    if (Object.keys(markers).length > 0) {
        const bounds = Object.values(markers).map(marker => marker.getLatLng());
        map.fitBounds(bounds);
    }
}

// View emergency details
async function viewEmergencyDetails(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/emergencies/${id}`);
        if (!response.ok) throw new Error('Failed to fetch emergency details');
        
        const emergency = await response.json();
        
        // Update modal content
        document.getElementById('emergency-type').textContent = emergency.type;
        document.getElementById('emergency-status').textContent = emergency.status;
        document.getElementById('emergency-priority').textContent = emergency.priority;
        document.getElementById('emergency-time').textContent = formatTimeAgo(emergency.createdAt);
        document.getElementById('reporter-name').textContent = emergency.reporterName;
        document.getElementById('reporter-contact').textContent = emergency.contactNumber;
        document.getElementById('emergency-description').textContent = emergency.description;
        document.getElementById('emergency-notes').textContent = emergency.additionalNotes || 'No additional notes';
        
        // Set current status and priority in selects
        document.getElementById('status-select').value = emergency.status;
        document.getElementById('priority-select').value = emergency.priority;

        // Store emergency ID for update function
        document.querySelector('.update-btn').setAttribute('data-emergency-id', id);
        
        // Initialize detail map
        initializeDetailMap(emergency);
        
        // Show media if available
        updateMediaGrid(emergency.mediaUrls || []);
        
        // Show modal
        const modal = document.querySelector('.emergency-details-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching emergency details:', error);
        showNotification({
            type: 'error',
            message: 'Failed to load emergency details',
            duration: 3000
        });
    }
}

// Initialize map in the emergency details modal
function initializeDetailMap(emergency) {
    const detailMap = document.getElementById('detail-map');
    if (!detailMap || !emergency.location || !emergency.location.coordinates) return;
    
    const { lat, lng } = emergency.location.coordinates;
    
    if (detailMap._leaflet_id) {
        detailMap._leaflet = null;
        detailMap.innerHTML = '';
    }
    
    const map = L.map('detail-map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map);
}

// Update media grid in emergency details modal
function updateMediaGrid(mediaUrls = []) {
    const mediaGrid = document.getElementById('emergency-media');
    if (!mediaGrid) return;
    
    if (!mediaUrls.length) {
        mediaGrid.innerHTML = '<p>No media files available</p>';
        return;
    }
    
    mediaGrid.innerHTML = mediaUrls.map(url => `
        <div class="media-item">
            ${url.match(/\.(jpg|jpeg|png|gif)$/i)
                ? `<img src="${url}" alt="Emergency media" onclick="openMediaViewer('${url}')">`
                : `<video src="${url}" controls></video>`
            }
        </div>
    `).join('');
}

// Update emergency status
async function updateEmergencyStatus() {
    const statusSelect = document.getElementById('status-select');
    const prioritySelect = document.getElementById('priority-select');
    const updateBtn = document.querySelector('.update-btn');
    const id = updateBtn.getAttribute('data-emergency-id');
    
    if (!id) {
        showNotification({
            type: 'error',
            message: 'Emergency ID not found',
            duration: 3000
        });
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/emergencies/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: statusSelect.value,
                priority: prioritySelect.value
            })
        });
        
        if (!response.ok) throw new Error('Failed to update emergency');
        
        showNotification({
            type: 'success',
            message: 'Emergency updated successfully',
            duration: 3000
        });
        
        // Close modal and refresh data
        closeEmergencyModal();
        fetchEmergencies();
        
    } catch (error) {
        console.error('Error updating emergency:', error);
        showNotification({
            type: 'error',
            message: 'Failed to update emergency',
            duration: 3000
        });
    }
}

// Close emergency details modal
function closeEmergencyModal() {
    const modal = document.querySelector('.emergency-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize WebSocket connection
function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'new_emergency' || data.type === 'emergency_update') {
            fetchEmergencies();
            showNotification({
                type: 'info',
                message: data.type === 'new_emergency' 
                    ? 'New emergency reported'
                    : 'Emergency status updated',
                duration: 3000
            });
        }
    };
    
    ws.onclose = function() {
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
    };
}

// Set up event listeners for dashboard controls
function setupEventListeners() {
    // Type filter
    const feedFilter = document.querySelector('.feed-filter');
    if (feedFilter) {
        feedFilter.addEventListener('change', (e) => {
            filterEmergencies(e.target.value);
        });
    }

    // Status filter
    const mapControls = document.querySelector('.map-controls');
    if (mapControls) {
        mapControls.addEventListener('click', (e) => {
            if (e.target.classList.contains('control-btn')) {
                const status = e.target.dataset.status;
                document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                filterEmergencies('all', status);
            }
        });
    }

    // Emergency type filters
    const typeFilters = document.querySelectorAll('[data-type]');
    typeFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            filterEmergencies(filter.dataset.type);
        });
    });

    // Status filters
    const statusFilters = document.querySelectorAll('[data-status]');
    statusFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            filterEmergencies('all', filter.dataset.status);
        });
    });
}

// Initialize and handle chart resizing
function initializeChartResizing() {
    const chartContainers = document.querySelectorAll('.emergency-type-chart');
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const canvas = entry.target.querySelector('canvas');
            if (canvas && canvas.chart) {
                canvas.chart.resize();
            }
        }
    });

    chartContainers.forEach(container => {
        resizeObserver.observe(container);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    initializeMap();
    initializeChartResizing();
    fetchEmergencies(); // Initial fetch
    
    // Initialize charts with empty data
    updateEmergencyTypeChart();
    updateStatusChart();
    updateTrendChart();
    
    // Set up periodic refresh every 30 seconds
    setInterval(fetchEmergencies, 30000);
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up modal close button
    const closeBtn = document.querySelector('.emergency-details-modal .close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEmergencyModal);
    }
});

// Update charts with emergency statistics
function updateCharts() {
    updateEmergencyTypeChart();
    updateStatusChart();
    updateTrendChart();
}

// Update emergency types distribution chart
function updateEmergencyTypeChart() {
    const typeStats = {
        medical: 0,
        fire: 0,
        police: 0,
        disaster: 0
    };

    emergencies.forEach(emergency => {
        if (typeStats.hasOwnProperty(emergency.type.toLowerCase())) {
            typeStats[emergency.type.toLowerCase()]++;
        }
    });

    const typeChart = document.getElementById('emergencyTypeChart');
    if (!typeChart) return;

    const ctx = typeChart.getContext('2d');
    
    // Destroy existing chart if it exists
    if (typeChart.chart) {
        typeChart.chart.destroy();
    }

    // Create new chart
    typeChart.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Medical', 'Fire', 'Police', 'Natural Disaster'],
            datasets: [{
                data: [
                    typeStats.medical,
                    typeStats.fire,
                    typeStats.police,
                    typeStats.disaster
                ],
                backgroundColor: [
                    '#FF6384',
                    '#FF9F40',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Emergency Types Distribution'
                }
            }
        }
    });
}

// Update emergency status distribution chart
function updateStatusChart() {
    const statusStats = {
        pending: 0,
        active: 0,
        resolved: 0
    };

    emergencies.forEach(emergency => {
        if (statusStats.hasOwnProperty(emergency.status)) {
            statusStats[emergency.status]++;
        }
    });

    const statusChart = document.getElementById('statusChart');
    if (!statusChart) return;

    const ctx = statusChart.getContext('2d');
    
    if (statusChart.chart) {
        statusChart.chart.destroy();
    }

    statusChart.chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pending', 'Active', 'Resolved'],
            datasets: [{
                data: [
                    statusStats.pending,
                    statusStats.active,
                    statusStats.resolved
                ],
                backgroundColor: [
                    '#FFC107',
                    '#DC3545',
                    '#28A745'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Emergency Status Distribution'
                }
            }
        }
    });
}

// Update emergency trend chart
function updateTrendChart() {
    // Get the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    // Count emergencies per day
    const dailyCounts = dates.map(date => {
        return emergencies.filter(emergency => 
            emergency.createdAt.split('T')[0] === date
        ).length;
    });

    const trendChart = document.getElementById('trendChart');
    if (!trendChart) return;

    const ctx = trendChart.getContext('2d');
    
    if (trendChart.chart) {
        trendChart.chart.destroy();
    }

    trendChart.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => {
                const [year, month, day] = date.split('-');
                return `${month}/${day}`;
            }),
            datasets: [{
                label: 'Number of Emergencies',
                data: dailyCounts,
                borderColor: '#0D6EFD',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Emergency Reports Trend (Last 7 Days)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Create popup content for emergency markers
function createEmergencyPopup(emergency) {
    return `
        <div class="emergency-popup">
            <div class="popup-header ${emergency.status}">
                <h4>${emergency.type}</h4>
                <span class="status-badge">${emergency.status}</span>
            </div>
            <div class="popup-body">
                <p><strong>Priority:</strong> ${emergency.priority}</p>
                <p><strong>Reporter:</strong> ${emergency.reporterName}</p>
                <p><strong>Description:</strong> ${emergency.description}</p>
                <p><strong>Time:</strong> ${formatTimeAgo(emergency.createdAt)}</p>
            </div>
            <div class="popup-footer">
                <button onclick="viewEmergencyDetails(${emergency.id})" class="popup-btn">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Format time ago function
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    return `${Math.floor(months / 12)}y ago`;
}