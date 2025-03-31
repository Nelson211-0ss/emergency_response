let map = null;
let markers = {};

// Initialize map only if it hasn't been initialized yet
export function initializeMap() {
    if (!map) {
        const mapContainer = document.getElementById('emergencyMap');
        // Check if map container exists and doesn't already have a map
        if (mapContainer && !mapContainer._leaflet_id) {
            map = L.map('emergencyMap').setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }
    }
    return map;
}

// Update emergency map with markers
export function updateEmergencyMap(emergencies) {
    const map = initializeMap();
    if (!map) return;
    
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

let detailMap = null;

export function initializeDetailMap(emergency) {
    if (detailMap) {
        detailMap.remove();
    }

    const mapElement = document.getElementById('detail-map');
    if (!mapElement) return;

    detailMap = L.map('detail-map').setView([emergency.location.lat, emergency.location.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(detailMap);

    // Add marker for emergency location
    const marker = L.marker([emergency.location.lat, emergency.location.lng])
        .addTo(detailMap)
        .bindPopup(`
            <strong>${emergency.type} Emergency</strong><br>
            Status: ${emergency.status}<br>
            Priority: ${emergency.priority}
        `);

    marker.openPopup();

    // Force map to update its container size
    setTimeout(() => {
        detailMap.invalidateSize();
    }, 100);
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
                <button onclick="window.viewEmergencyDetails(${emergency.id})" class="popup-btn">
                    View Details
                </button>
            </div>
        </div>
    `;
}