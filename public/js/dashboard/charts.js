// Update charts with emergency statistics
export function updateCharts(emergencies) {
    updateEmergencyTypeChart(emergencies);
    updateStatusChart(emergencies);
    updateTrendChart(emergencies);
}

// Update emergency types distribution chart
function updateEmergencyTypeChart(emergencies) {
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
function updateStatusChart(emergencies) {
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
function updateTrendChart(emergencies) {
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

// Initialize chart resizing
export function initializeChartResizing() {
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