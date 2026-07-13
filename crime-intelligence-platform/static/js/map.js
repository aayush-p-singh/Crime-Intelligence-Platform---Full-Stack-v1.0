document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    lucide.createIcons();

    // 2. Real-time UTC System Clock
    const sysTimeElement = document.getElementById('sys-time');
    function updateSystemTime() {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        if (sysTimeElement) {
            sysTimeElement.textContent = `${hours}:${minutes}:${seconds} UTC`;
        }
    }
    updateSystemTime();
    setInterval(updateSystemTime, 1000);

    // 3. Search Bar Shortcut
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // 4. Map Zoom Controls Placeholder Logic
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    
    // (This logic scales the internal SVG injected by your backend)
    let currentScale = 1;
    function applyTransform() {
        const svg = document.querySelector('#india-map-container svg');
        if (svg) svg.style.transform = `scale(${currentScale})`;
    }

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => { currentScale += 0.2; applyTransform(); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { currentScale = Math.max(0.5, currentScale - 0.2); applyTransform(); });
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => { currentScale = 1; applyTransform(); });

    // 5. Chart.js Global Configuration for Dark UI (matching Dashboard)
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#e2e8f0';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;

    // 6. Top States Chart (Empty Placeholder for Injection)
    const topStatesCtx = document.getElementById('topStatesChart');
    if (topStatesCtx) {
        // Initialize an empty horizontal bar chart
        // Your backend/AJAX call will update chartInstance.data and call chartInstance.update()
        window.topStatesChartInstance = new Chart(topStatesCtx, {
            type: 'bar',
            data: {
                labels: ['--', '--', '--', '--', '--'], // Placeholders
                datasets: [{
                    label: 'Threat Volume',
                    data: [0, 0, 0, 0, 0], // Placeholders
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red base
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bar
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { 
                        beginAtZero: true, 
                        grid: { display: true, color: 'rgba(255, 255, 255, 0.05)' } 
                    },
                    y: { 
                        grid: { display: false } 
                    }
                }
            }
        });
    }

    // 7. Button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            if(!this.disabled) this.style.transform = 'scale(0.97)';
        });
        btn.addEventListener('mouseup', function() {
            if(!this.disabled) this.style.transform = 'translateY(-1px)'; 
        });
        btn.addEventListener('mouseleave', function() {
            if(!this.disabled) this.style.transform = '';
        });
    });
});

/**
 * Utility Function Example for Backend Injection
 * Call this from your fetch/AJAX promise when a state is hovered or clicked on the SVG map.
 */
function updateStateDetailsPanel(data) {
    // Example data object: { name: 'Maharashtra', level: 'CRITICAL', incidents: 42, signals: 104, vector: 'Cyber', assets: 'Online' }
    
    const nameEl = document.getElementById('detail-state-name');
    const levelEl = document.getElementById('detail-threat-level');
    const reportBtn = document.getElementById('view-sector-report-btn');

    if (!data) {
        // Reset to empty
        nameEl.textContent = 'No Sector Selected';
        nameEl.classList.add('empty-data');
        levelEl.textContent = '--';
        levelEl.className = 'threat-badge empty-badge';
        document.getElementById('detail-incident-count').textContent = '--';
        document.getElementById('detail-signal-count').textContent = '--';
        document.getElementById('detail-primary-vector').textContent = '--';
        document.getElementById('detail-asset-status').textContent = '--';
        reportBtn.disabled = true;
        return;
    }

    nameEl.textContent = data.name;
    nameEl.classList.remove('empty-data');
    
    levelEl.textContent = data.level;
    // Apply styling based on severity
    if(data.level === 'CRITICAL') {
        levelEl.className = 'threat-badge';
        levelEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        levelEl.style.color = 'var(--accent-red)';
    } else if (data.level === 'ELEVATED') {
        levelEl.className = 'threat-badge';
        levelEl.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
        levelEl.style.color = 'var(--accent-warning)';
    } else {
        levelEl.className = 'threat-badge';
        levelEl.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        levelEl.style.color = 'var(--accent-blue)';
    }

    document.getElementById('detail-incident-count').textContent = data.incidents;
    document.getElementById('detail-signal-count').textContent = data.signals;
    document.getElementById('detail-primary-vector').textContent = data.vector;
    document.getElementById('detail-asset-status').textContent = data.assets;
    
    reportBtn.disabled = false;
}