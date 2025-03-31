import { getEmergencyDetails, updateEmergencyStatus as updateEmergencyApi } from './api.js';
import { showNotification } from './notifications.js';
import { initializeDetailMap } from './map.js';
import { formatTimeAgo } from './utils.js';

// Update media grid in emergency details modal
function updateMediaGrid(mediaUrls = []) {
    const mediaGrid = document.getElementById('emergency-media');
    if (!mediaGrid) return;
    
    if (!mediaUrls || !mediaUrls.length) {
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

// View emergency details
export async function viewEmergencyDetails(id) {
    try {
        const emergency = await getEmergencyDetails(id);
        const modal = document.querySelector('.emergency-details-modal');
        
        if (!modal) {
            console.error('Modal element not found');
            return;
        }

        // Update modal content
        const fields = {
            'emergency-type': emergency.type,
            'emergency-status': emergency.status,
            'emergency-priority': emergency.priority,
            'emergency-time': formatTimeAgo(emergency.createdAt),
            'reporter-name': emergency.reporterName,
            'reporter-contact': emergency.contactNumber,
            'emergency-description': emergency.description,
            'emergency-notes': emergency.additionalNotes || 'No additional notes'
        };

        // Update all fields
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Set current status and priority in selects
        const statusSelect = document.getElementById('status-select');
        const prioritySelect = document.getElementById('priority-select');
        if (statusSelect) statusSelect.value = emergency.status;
        if (prioritySelect) prioritySelect.value = emergency.priority;

        // Store emergency ID for update function
        const updateBtn = document.querySelector('.update-emergency-btn');
        if (updateBtn) {
            updateBtn.setAttribute('data-emergency-id', id);
        }
        
        // Initialize detail map
        initializeDetailMap(emergency);
        
        // Show media if available
        updateMediaGrid(emergency.mediaUrls || []);
        
        // Show modal with animation
        modal.classList.add('active');
        
        // Set up close handlers if not already set
        setupModalCloseHandlers(modal);

    } catch (error) {
        console.error('Error fetching emergency details:', error);
        showNotification({
            type: 'error',
            message: 'Failed to load emergency details',
            duration: 3000
        });
    }
}

// Setup modal close handlers
function setupModalCloseHandlers(modal) {
    // Close on X button click
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeEmergencyModal();
    }

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeEmergencyModal();
        }
    };

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeEmergencyModal();
        }
    });
}

// Close emergency details modal
export function closeEmergencyModal() {
    const modal = document.querySelector('.emergency-details-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Update emergency status
export async function updateEmergencyStatus() {
    const statusSelect = document.getElementById('status-select');
    const prioritySelect = document.getElementById('priority-select');
    const updateBtn = document.querySelector('.update-emergency-btn');
    const id = updateBtn?.getAttribute('data-emergency-id');
    
    if (!id) {
        showNotification({
            type: 'error',
            message: 'Emergency ID not found',
            duration: 3000
        });
        return;
    }
    
    try {
        await updateEmergencyApi(id, statusSelect.value, prioritySelect.value);
        
        showNotification({
            type: 'success',
            message: 'Emergency updated successfully',
            duration: 3000
        });
        
        // Close modal
        closeEmergencyModal();
        
        // Refresh dashboard data
        window.refreshDashboard?.();
        
    } catch (error) {
        console.error('Error updating emergency:', error);
        showNotification({
            type: 'error',
            message: 'Failed to update emergency',
            duration: 3000
        });
    }
}

// Add event listeners when module loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up update button
    const updateBtn = document.querySelector('.update-emergency-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateEmergencyStatus);
    }
});