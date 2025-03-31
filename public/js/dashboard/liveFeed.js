import { getEmergencyIcon, formatPhoneNumber, capitalizeFirstLetter, formatTimeAgo } from './utils.js';
import { fetchEmergenciesRealtime, getEmergencyDetails, updateEmergencyStatusWithNotes } from './api.js';

// Initialize WebSocket connection
const ws = new WebSocket(`ws://${window.location.host}`);

// Handle WebSocket events
ws.onopen = () => {
    console.log('Connected to server');
    ws.send(JSON.stringify({ type: 'REQUEST_EMERGENCIES' }));
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'REFRESH_NEEDED':
                // Fetch fresh data using regular HTTP endpoints
                fetchEmergencies();
                break;
            case 'ERROR':
                console.error('Server error:', data.message);
                showNotification(data.message, 'error');
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
};

ws.onclose = () => {
    console.log('Disconnected from server');
    setTimeout(() => {
        window.location.reload();
    }, 5000);
};

// Add window function for data refresh
window.refreshEmergencyData = () => {
    ws.send(JSON.stringify({ type: 'REQUEST_EMERGENCIES' }));
};

// Function to fetch emergencies via HTTP
async function fetchEmergencies() {
    try {
        const data = await fetchEmergenciesRealtime();
        updateOverviewCards(data);
        updateLiveFeed(data);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to fetch emergencies', 'error');
    }
}

// Update overview cards with counts
export function updateOverviewCards(emergencies) {
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

// Update live feed with recent emergencies
export function updateLiveFeed(emergencies) {
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
                        <button onclick="window.viewEmergencyDetails(${emergency.id})" class="view-btn">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="window.updateEmergencyStatus(${emergency.id})" class="update-btn">
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

// Filter emergencies based on type and status
export function filterEmergencies(emergencies, type = 'all', status = null) {
    let filtered = [...emergencies];
    
    if (type !== 'all') {
        filtered = filtered.filter(e => e.type.toLowerCase() === type.toLowerCase());
    }
    
    if (status) {
        filtered = filtered.filter(e => e.status === status);
    }
    
    updateLiveFeed(filtered);
    return filtered;
}

// Define window functions for emergency actions
window.viewEmergencyDetails = async (emergencyId) => {
    try {
        const modal = document.getElementById('emergency-details-modal');
        if (!modal) return;

        const details = await getEmergencyDetails(emergencyId);
        modal.classList.remove('hidden');
        displayEmergencyDetails(details);

    } catch (error) {
        console.error('Error viewing emergency details:', error);
        showNotification('Failed to load emergency details', 'error');
    }
};

window.updateEmergencyStatus = async (emergencyId) => {
    try {
        const modal = document.getElementById('status-update-modal');
        if (!modal) return;

        const details = await getEmergencyDetails(emergencyId);
        modal.classList.remove('hidden');
        modal.setAttribute('data-emergency-id', emergencyId);
        
        const statusSelect = modal.querySelector('select[name="status"]');
        if (statusSelect) {
            statusSelect.value = details.status;
        }
    } catch (error) {
        console.error('Error loading emergency for update:', error);
        showNotification('Failed to load emergency status', 'error');
    }
};

// Add modal close handlers
document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) modal.classList.add('hidden');
    });
});

// Handle status update form submission
document.getElementById('status-update-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = document.getElementById('status-update-modal');
    const emergencyId = modal?.getAttribute('data-emergency-id');
    const statusSelect = e.target.querySelector('select[name="status"]');
    const notes = e.target.querySelector('textarea[name="notes"]')?.value;

    if (!emergencyId || !statusSelect) return;

    try {
        await updateEmergencyStatusWithNotes(emergencyId, statusSelect.value, notes);
        modal.classList.add('hidden');
        showNotification('Status updated successfully', 'success');
        window.refreshEmergencyData();
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Failed to update status', 'error');
    }
});

// Helper function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Helper function to display emergency details in modal
function displayEmergencyDetails(details) {
    const detailsContainer = document.querySelector('.emergency-details-content');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <h3 class="text-xl font-bold mb-4">${details.type} Emergency</h3>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p><strong>Status:</strong> ${capitalizeFirstLetter(details.status)}</p>
                <p><strong>Priority:</strong> ${details.priority}</p>
                <p><strong>Reporter:</strong> ${details.reporterName}</p>
                <p><strong>Contact:</strong> ${formatPhoneNumber(details.contactNumber)}</p>
            </div>
            <div>
                <p><strong>Location:</strong> ${details.location}</p>
                <p><strong>Created:</strong> ${new Date(details.createdAt).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(details.updatedAt).toLocaleString()}</p>
            </div>
        </div>
        <div class="mt-4">
            <p><strong>Description:</strong></p>
            <p class="text-gray-700">${details.description}</p>
        </div>
    `;
}