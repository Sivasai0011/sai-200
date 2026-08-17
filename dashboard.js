/**
 * RoadVision AI - Analytics Dashboard & Canvas Heatmap Controller
 * Manages Chart.js visualizations, incident heatmaps, HUD feeds, and PDF exports.
 */

class DashboardController {
    constructor() {
        this.charts = {};
        this.heatmapCanvas = null;
        this.heatmapCtx = null;
    }

    initCharts() {
        if (!window.Chart) return;

        // 1. Prediction Timeline Chart
        const timelineCtx = document.getElementById('chartPredictionTimeline')?.getContext('2d');
        if (timelineCtx) {
            this.charts.timeline = new Chart(timelineCtx, {
                type: 'line',
                data: {
                    labels: ['-10s', '-8s', '-6s', '-4s', '-2s', 'Now'],
                    datasets: [{
                        label: 'Collision Probability %',
                        data: [12, 18, 25, 42, 68, 85],
                        borderColor: '#ff0055',
                        backgroundColor: 'rgba(255, 0, 85, 0.15)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'AI Safety Index',
                        data: [98, 96, 95, 92, 88, 94.2],
                        borderColor: '#00ff88',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#8d99ae', font: { family: 'Rajdhani', size: 12 } } } },
                    scales: {
                        x: { ticks: { color: '#8d99ae' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#8d99ae' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

        // 2. Speed Analytics Chart
        const speedCtx = document.getElementById('chartSpeedAnalytics')?.getContext('2d');
        if (speedCtx) {
            this.charts.speed = new Chart(speedCtx, {
                type: 'bar',
                data: {
                    labels: ['Sedan', 'Sports', 'SUV', 'Truck', 'Bus', 'Ambulance'],
                    datasets: [{
                        label: 'Avg Speed (km/h)',
                        data: [54, 78, 48, 42, 38, 65],
                        backgroundColor: ['#00f0ff', '#ff0055', '#00ff88', '#ffb700', '#9d4edd', '#ff0000'],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8d99ae' }, grid: { display: false } },
                        y: { ticks: { color: '#8d99ae' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

        // 3. Live Traffic Graph
        const trafficCtx = document.getElementById('chartTrafficGraph')?.getContext('2d');
        if (trafficCtx) {
            this.charts.traffic = new Chart(trafficCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Normal Flow', 'Moderate Risk', 'Critical Risk', 'Congestion'],
                    datasets: [{
                        data: [72, 18, 7, 3],
                        backgroundColor: ['#00ff88', '#ffb700', '#ff0055', '#9d4edd']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: '#8d99ae', font: { family: 'Rajdhani', size: 12 } } } }
                }
            });
        }

        this.initHeatmapCanvas();
    }

    initHeatmapCanvas() {
        this.heatmapCanvas = document.getElementById('canvasHeatmap');
        if (this.heatmapCanvas) {
            this.heatmapCtx = this.heatmapCanvas.getContext('2d');
        }
    }

    updateHeatmap(vehicles) {
        if (!this.heatmapCtx || !this.heatmapCanvas) return;
        const width = this.heatmapCanvas.width;
        const height = this.heatmapCanvas.height;

        // Clear canvas
        this.heatmapCtx.fillStyle = '#06090e';
        this.heatmapCtx.fillRect(0, 0, width, height);

        // Draw street grid backdrop
        this.heatmapCtx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        this.heatmapCtx.lineWidth = 2;
        for (let i = 20; i < width; i += 40) {
            this.heatmapCtx.beginPath();
            this.heatmapCtx.moveTo(i, 0); this.heatmapCtx.lineTo(i, height);
            this.heatmapCtx.moveTo(0, i); this.heatmapCtx.lineTo(width, i);
            this.heatmapCtx.stroke();
        }

        // Render vehicle positions & risk hotspots
        vehicles.forEach(v => {
            // Map 3D pos (-200 to 200) to Canvas (0 to width)
            const cx = ((v.mesh.position.x + 200) / 400) * width;
            const cy = ((v.mesh.position.z + 200) / 400) * height;

            const grad = this.heatmapCtx.createRadialGradient(cx, cy, 2, cx, cy, v.riskScore > 60 ? 25 : 12);

            if (v.riskScore >= 70) {
                grad.addColorStop(0, 'rgba(255, 0, 85, 0.8)');
                grad.addColorStop(1, 'rgba(255, 0, 85, 0)');
            } else if (v.riskScore >= 40) {
                grad.addColorStop(0, 'rgba(255, 183, 0, 0.7)');
                grad.addColorStop(1, 'rgba(255, 183, 0, 0)');
            } else {
                grad.addColorStop(0, 'rgba(0, 255, 136, 0.6)');
                grad.addColorStop(1, 'rgba(0, 255, 136, 0)');
            }

            this.heatmapCtx.fillStyle = grad;
            this.heatmapCtx.beginPath();
            this.heatmapCtx.arc(cx, cy, v.riskScore > 60 ? 25 : 12, 0, Math.PI * 2);
            this.heatmapCtx.fill();

            // Vehicle dot marker
            this.heatmapCtx.fillStyle = '#ffffff';
            this.heatmapCtx.fillRect(cx - 2, cy - 2, 4, 4);
        });
    }

    updateDashboardStats(statsData) {
        document.querySelectorAll('.val-active-vehicles').forEach(el => el.textContent = statsData.totalVehicles);
        document.querySelectorAll('.val-safety-index').forEach(el => el.textContent = statsData.safetyIndex + '%');
        document.querySelectorAll('.val-confidence-score').forEach(el => el.textContent = statsData.confidenceScore);
        document.querySelectorAll('.val-avg-speed').forEach(el => el.textContent = statsData.avgSpeed + ' km/h');
        document.querySelectorAll('.val-high-risk').forEach(el => el.textContent = statsData.highRiskVehicles);
    }

    updateIncidentFeed(incidents, filterSeverity = 'ALL') {
        const feedContainer = document.getElementById('incidentFeedContainer');
        if (!feedContainer) return;

        const filtered = incidents.filter(inc => filterSeverity === 'ALL' || inc.severity === filterSeverity);

        if (filtered.length === 0) {
            feedContainer.innerHTML = '<div class="feed-empty"><i class="fa-solid fa-shield-halved"></i> No active collision threats detected in city sector.</div>';
            return;
        }

        let html = '';
        filtered.forEach(inc => {
            const badgeClass = inc.severity === 'CRITICAL' ? 'badge-danger' : (inc.severity === 'HIGH' ? 'badge-warning' : 'badge-info');
            html += `
                <div class="feed-card ${inc.severity.toLowerCase()}">
                    <div class="feed-card-header">
                        <span class="badge ${badgeClass}"><i class="fa-solid fa-triangle-exclamation"></i> ${inc.severity}</span>
                        <span class="feed-time">${inc.timestamp}</span>
                    </div>
                    <div class="feed-title">${inc.type}</div>
                    <div class="feed-details">
                        <span><i class="fa-solid fa-car"></i> Target: <strong>${inc.vehicleId}</strong></span>
                        <span><i class="fa-solid fa-percent"></i> Probability: <strong>${inc.probability}%</strong></span>
                        <span><i class="fa-solid fa-clock"></i> TTC: <strong>${inc.ttc}s</strong></span>
                    </div>
                    <div class="feed-recommendation">
                        <i class="fa-solid fa-robot"></i> <strong>AI Action:</strong> ${inc.recommendation}
                    </div>
                </div>
            `;
        });

        feedContainer.innerHTML = html;
    }

    exportPDFReport(aiEngine, vehicleManager) {
        const doc = window.open('', '_blank');
        if (!doc) {
            alert("Please allow popups to generate the AI Prediction Report PDF.");
            return;
        }

        const dateStr = new Date().toLocaleString();
        const activeVehicles = vehicleManager.vehicles.length;
        const criticalIncidents = aiEngine.incidents.filter(i => i.severity === 'CRITICAL').length;

        doc.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>RoadVision AI - Smart City Accident Prediction Report</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #06090e; color: #e2e8f0; padding: 40px; margin: 0; }
                    .header { border-bottom: 2px solid #00f0ff; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                    .logo { font-size: 28px; font-weight: bold; color: #00ff88; letter-spacing: 2px; }
                    .subtitle { color: #8d99ae; font-size: 14px; }
                    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
                    .card { background: #0f172a; border: 1fr solid #1e293b; padding: 20px; border-radius: 8px; text-align: center; }
                    .card-val { font-size: 32px; font-weight: bold; color: #00f0ff; margin-top: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { border: 1px solid #1e293b; padding: 12px; text-align: left; }
                    th { background: #0f172a; color: #00ff88; }
                    tr:nth-child(even) { background: #0b1120; }
                    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                    .badge-danger { background: #ff0055; color: white; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; }
                    @media print { body { background: white; color: black; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">ROADVISION AI</div>
                        <div class="subtitle">Autonomous Traffic Orchestration & Accident Prediction Platform</div>
                    </div>
                    <div style="text-align: right;">
                        <div>Report Generated: ${dateStr}</div>
                        <div>Status: OPERATIONAL</div>
                    </div>
                </div>

                <div class="grid">
                    <div class="card">
                        <div>Total Monitored Vehicles</div>
                        <div class="card-val">${activeVehicles}</div>
                    </div>
                    <div class="card">
                        <div>Road Safety Index</div>
                        <div class="card-val" style="color: #00ff88">${aiEngine.safetyIndex}%</div>
                    </div>
                    <div class="card">
                        <div>Active Critical Threats</div>
                        <div class="card-val" style="color: #ff0055">${criticalIncidents}</div>
                    </div>
                    <div class="card">
                        <div>AI Confidence Score</div>
                        <div class="card-val">98.4%</div>
                    </div>
                </div>

                <h2>Real-Time AI Incident Prediction Log</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Incident ID</th>
                            <th>Vehicle ID</th>
                            <th>Severity</th>
                            <th>Prediction Type</th>
                            <th>TTC (sec)</th>
                            <th>Probability</th>
                            <th>AI Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aiEngine.incidents.map(inc => `
                            <tr>
                                <td>${inc.id}</td>
                                <td>${inc.vehicleId}</td>
                                <td><span class="badge badge-danger">${inc.severity}</span></td>
                                <td>${inc.type}</td>
                                <td>${inc.ttc}s</td>
                                <td>${inc.probability}%</td>
                                <td>${inc.recommendation}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    Engineered with NVIDIA-Inspired Autonomous Drive Architecture. Confidential Report for Smart City Traffic Authorities.
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
    }
}

window.DashboardController = DashboardController;
