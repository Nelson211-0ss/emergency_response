// Initialize map
let map;
let marker;
let currentLocation = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    setupFormHandlers();
    setupMediaPreview();
});

// Initialize Leaflet map
function initializeMap() {
    map = L.map('emergencyMap').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler to map
    map.on('click', (e) => {
        setLocation(e.latlng);
    });
}

// Set up form event handlers
function setupFormHandlers() {
    // Emergency type selection
    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('selectedEmergencyType').value = card.dataset.type;
        });
    });

    // Get current location
    document.getElementById('getCurrentLocation').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setLocation(location);
                },
                error => {
                    showError('Could not get your location. Please enter it manually.');
                }
            );
        } else {
            showError('Geolocation is not supported by your browser.');
        }
    });

    // Manual address input
    const addressInput = document.getElementById('manual-address');
    addressInput.addEventListener('change', async () => {
        try {
            const address = addressInput.value;
            const location = await geocodeAddress(address);
            setLocation(location);
        } catch (error) {
            showError('Could not find location. Please try again.');
        }
    });

    // Form submission
    document.getElementById('emergencyReportForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(e.target);
        
        // Ensure we're using the correct field name for emergency type
        const emergencyType = formData.get('emergencyType');
        formData.set('emergencyType', emergencyType); // This ensures the field name matches what the server expects

        try {
            const response = await fetch('http://localhost:3000/api/emergencies/report', {  
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit report');
            }

            const result = await response.json();
            showSuccess('Emergency reported successfully. Help is on the way!');
            
            // Reset form after successful submission
            e.target.reset();
            resetMap();
            clearMediaPreviews();
            
            // Redirect to status page after 3 seconds
            setTimeout(() => {
                window.location.href = `/emergency-status.html?id=${result.emergencyId}`;
            }, 3000);

        } catch (error) {
            showError(error.message || 'Failed to submit emergency report. Please try again.');
            console.error('Submission error:', error);
        }
    });
}

// Set location on map
function setLocation(latlng) {
    if (marker) {
        marker.remove();
    }
    
    marker = L.marker(latlng).addTo(map);
    map.setView(latlng, 15);
    
    // Update hidden location input
    document.getElementById('location-data').value = JSON.stringify({
        type: 'Point',
        coordinates: [latlng.lat, latlng.lng]
    });

    // Reverse geocode to get address
    reverseGeocode(latlng)
        .then(address => {
            document.getElementById('manual-address').value = address;
        })
        .catch(console.error);
}

// Handle media file preview
function setupMediaPreview() {
    const mediaInput = document.getElementById('media-files');
    const previewContainer = document.getElementById('media-preview');

    mediaInput.addEventListener('change', () => {
        previewContainer.innerHTML = '';
        
        Array.from(mediaInput.files).forEach(file => {
            const reader = new FileReader();
            const preview = document.createElement('div');
            preview.className = 'preview-item';

            reader.onload = (e) => {
                if (file.type.startsWith('image/')) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-media">&times;</button>
                    `;
                } else if (file.type.startsWith('video/')) {
                    preview.innerHTML = `
                        <video src="${e.target.result}" controls></video>
                        <button type="button" class="remove-media">&times;</button>
                    `;
                }
            };

            reader.readAsDataURL(file);
            previewContainer.appendChild(preview);
        });
    });

    // Handle remove buttons
    previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-media')) {
            e.target.parentElement.remove();
            // Note: You'll need to handle the actual file removal from the input
        }
    });
}

// Form validation
function validateForm() {
    const requiredFields = {
        'selectedEmergencyType': 'Please select an emergency type',
        'reporter-name': 'Please enter your name',
        'contact-number': 'Please enter your contact number',
        'emergency-description': 'Please describe the emergency',
        'location-data': 'Please specify the location'
    };

    for (const [id, message] of Object.entries(requiredFields)) {
        const element = document.getElementById(id);
        if (!element || !element.value) {
            showError(message);
            if (element) element.focus();
            return false;
        }
    }

    return true;
}

// Helper functions
async function geocodeAddress(address) {
    // Implement geocoding using your preferred service
    // Example using Nominatim (OpenStreetMap):
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    
    if (data.length === 0) {
        throw new Error('Address not found');
    }
    
    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
}

async function reverseGeocode(latlng) {
    // Implement reverse geocoding using your preferred service
    // Example using Nominatim (OpenStreetMap):
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
    const data = await response.json();
    
    return data.display_name;
}

function showError(message) {
    // Implement error notification
    alert(message); // Replace with better UI notification
}

function showSuccess(message) {
    // Implement success notification
    alert(message); // Replace with better UI notification
}

function resetMap() {
    if (marker) {
        marker.remove();
    }
    map.setView([0, 0], 2);
    document.getElementById('location-data').value = '';
    document.getElementById('manual-address').value = '';
}

function clearMediaPreviews() {
    document.getElementById('media-preview').innerHTML = '';
    document.getElementById('media-files').value = '';
} 