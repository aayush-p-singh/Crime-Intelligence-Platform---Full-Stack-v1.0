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

    // 4. Button Animations
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

    // 5. Chart.js Global Configuration for Dark UI
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

    const stateAColor = '#3b82f6'; // Blue
    const stateBColor = '#a855f7'; // Purple
    const stateABg = 'rgba(59, 130, 246, 0.2)';
    const stateBBg = 'rgba(168, 85, 247, 0.2)';

    // A. Trend Comparison Chart (Line)
    const trendCtx = document.getElementById('trendCompareChart');
    if (trendCtx) {
        window.trendCompareChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [
                    {
                        label: 'Sector Alpha',
                        data: [0, 0, 0, 0, 0, 0, 0], // Placeholders
                        borderColor: stateAColor,
                        backgroundColor: stateABg,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3
                    },
                    {
                        label: 'Sector Beta',
                        data: [0, 0, 0, 0, 0, 0, 0], // Placeholders
                        borderColor: stateBColor,
                        backgroundColor: stateBBg,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // B. Radar Compare Chart (Vector Analysis)
    const radarCtx = document.getElementById('radarCompareChart');
    if (radarCtx) {
        window.radarCompareChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Cyber', 'Kinetic', 'Insider', 'Signal', 'Espionage', 'Sabotage'],
                datasets: [
                    {
                        label: 'Sector Alpha',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: stateABg,
                        borderColor: stateAColor,
                        pointBackgroundColor: stateAColor,
                        pointBorderColor: '#fff',
                    },
                    {
                        label: 'Sector Beta',
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: stateBBg,
                        borderColor: stateBColor,
                        pointBackgroundColor: stateBColor,
                        pointBorderColor: '#fff',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace" } },
                        ticks: { display: false, min: 0 }
                    }
                }
            }
        });
    }

    // C. Category Compare Chart (Grouped Bar)
    const categoryCtx = document.getElementById('categoryCompareChart');
    if (categoryCtx) {
        window.categoryCompareChart = new Chart(categoryCtx, {
            type: 'bar',
            data: {
                labels: ['Malware', 'DDoS', 'Phishing', 'Physical Breach'],
                datasets: [
                    {
                        label: 'Sector Alpha',
                        data: [0, 0, 0, 0],
                        backgroundColor: stateAColor,
                        borderRadius: 4
                    },
                    {
                        label: 'Sector Beta',
                        data: [0, 0, 0, 0],
                        backgroundColor: stateBColor,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // D. Asset Compare Chart (Stacked Bar)
    const assetCtx = document.getElementById('assetCompareChart');
    if (assetCtx) {
        window.assetCompareChart = new Chart(assetCtx, {
            type: 'bar',
            data: {
                labels: ['Drones', 'Satellites', 'Field Agents', 'Sensors'],
                datasets: [
                    {
                        label: 'Sector Alpha',
                        data: [0, 0, 0, 0],
                        backgroundColor: stateAColor,
                        borderRadius: 4
                    },
                    {
                        label: 'Sector Beta',
                        data: [0, 0, 0, 0],
                        backgroundColor: stateBColor,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // 6. Action Hook Placeholder for Backend Integration
    const analyzeBtn = document.getElementById('run-compare-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const stateA = document.getElementById('state-a-select').value;
            const stateB = document.getElementById('state-b-select').value;
            
            // Validation
            if (!stateA || !stateB) {
                alert("Please select both sectors to initiate comparison analysis.");
                return;
            }

            // In a real application, you would trigger an AJAX fetch here
            // Example:
            // fetch(`/api/compare?stateA=${stateA}&stateB=${stateB}`)
            //   .then(res => res.json())
            //   .then(data => updateComparisonUI(data));
            
            console.log(`Initiating comparison analysis for ${stateA} vs ${stateB}...`);
            // Add loading states to UI here
        });
    }
});

/**
 * Utility Function to inject live data into the UI once fetched.
 */
function updateComparisonUI(data) {
    // 1. Update KPI Text Nodes
    // document.getElementById('kpi-incidents-a').textContent = data.stateA.incidents;
    // document.getElementById('kpi-incidents-b').textContent = data.stateB.incidents;
    // (Repeat for trends, signals, vulns, etc.)

    // 2. Update Charts
    // window.trendCompareChart.data.datasets[0].data = data.stateA.trendData;
    // window.trendCompareChart.data.datasets[1].data = data.stateB.trendData;
    // window.trendCompareChart.update();
    
    // (Repeat updates for radarCompareChart, categoryCompareChart, assetCompareChart)
}