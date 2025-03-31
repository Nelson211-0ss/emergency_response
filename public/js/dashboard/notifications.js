export function showNotification({ type = 'info', message, duration = 3000 }) {
    const container = document.createElement('div');
    container.className = `notification ${type}`;
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    // Set colors based on type
    switch (type) {
        case 'success':
            container.style.borderLeft = '4px solid #22c55e';
            container.style.backgroundColor = '#f0fdf4';
            break;
        case 'error':
            container.style.borderLeft = '4px solid #ef4444';
            container.style.backgroundColor = '#fef2f2';
            break;
        case 'warning':
            container.style.borderLeft = '4px solid #f59e0b';
            container.style.backgroundColor = '#fffbeb';
            break;
        default:
            container.style.borderLeft = '4px solid #3b82f6';
            container.style.backgroundColor = '#eff6ff';
    }

    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            ${getIcon(type)}
            <span style="color: #1f2937">${message}</span>
        </div>
    `;

    document.body.appendChild(container);

    // Remove notification after duration
    setTimeout(() => {
        container.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => container.remove(), 300);
    }, duration);
}

function getIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle" style="color: #22c55e"></i>';
        case 'error':
            return '<i class="fas fa-times-circle" style="color: #ef4444"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-circle" style="color: #f59e0b"></i>';
        default:
            return '<i class="fas fa-info-circle" style="color: #3b82f6"></i>';
    }
}

// Add necessary CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

export function initializeWebSocket(onUpdate) {
    try {
        const ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            console.log('WebSocket connection established');
            showNotification({
                type: 'success',
                message: 'Connected to real-time updates',
                duration: 3000
            });
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Show notification for new emergencies
            if (data.type === 'new-emergency') {
                showNotification({
                    type: 'warning',
                    message: `New ${data.emergency.type} emergency reported`,
                    duration: 5000
                });
            }
            
            // Show notification for status updates
            if (data.type === 'status-update') {
                showNotification({
                    type: 'info',
                    message: `Emergency #${data.emergency.id} status updated to ${data.emergency.status}`,
                    duration: 4000
                });
            }

            // Trigger dashboard update
            if (onUpdate && typeof onUpdate === 'function') {
                onUpdate();
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            showNotification({
                type: 'error',
                message: 'Error connecting to real-time updates',
                duration: 5000
            });
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => initializeWebSocket(onUpdate), 5000);
        };

        return ws;
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
        showNotification({
            type: 'error',
            message: 'Failed to initialize real-time updates',
            duration: 5000
        });
    }
}