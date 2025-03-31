// Fetch emergencies from the server
export async function fetchEmergencies() {
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

        return await response.json();
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        throw error;
    }
}

// Get emergency details by ID
export async function getEmergencyDetails(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/emergencies/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch emergency details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching emergency details:', error);
        throw error;
    }
}

// Update emergency status
export async function updateEmergencyStatus(id, status, priority) {
    try {
        const response = await fetch(`http://localhost:3000/api/emergencies/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status,
                priority
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update emergency');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating emergency:', error);
        throw error;
    }
}

// Get all emergencies with real-time updates
export async function fetchEmergenciesRealtime() {
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

        return await response.json();
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        throw error;
    }
}

// Update emergency status with notes
export async function updateEmergencyStatusWithNotes(emergencyId, status, notes) {
    try {
        const response = await fetch(`/api/emergencies/${emergencyId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status,
                notes
            })
        });

        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
}