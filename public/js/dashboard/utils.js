// Helper function to get appropriate icon for emergency type
export function getEmergencyIcon(type) {
    const icons = {
        'medical': '<i class="fas fa-ambulance"></i>',
        'fire': '<i class="fas fa-fire"></i>',
        'police': '<i class="fas fa-shield-alt"></i>',
        'disaster': '<i class="fas fa-exclamation-triangle"></i>'
    };
    return icons[type.toLowerCase()] || '<i class="fas fa-exclamation-circle"></i>';
}

// Helper function to format phone numbers
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}

// Helper function to capitalize first letter
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Format time ago function
export function formatTimeAgo(dateString) {
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