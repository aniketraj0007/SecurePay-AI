// js/alerts.js - Real-Time Fraud Alert Simulation & Logic
window.alerts = (function() {
    let alertList = [];
    let metrics = { total: 1248, high: 42, med: 115, low: 1091 };
    let alertInterval = null;

    const locations = ["New Delhi, India", "Mumbai, India", "New York, USA", "London, UK", "Dubai, UAE", "Bangalore, India", "Singapore City"];
    const devices = ["iPhone 15 Pro", "MacBook Air M2", "Unknown Android Emulator", "Windows 11 (Chrome)", "iPad Mini"];

    function initAlerts() {
        console.log("🚀 Initializing Alerts Monitoring Engine...");
        
        // 1. Initial Data Generation
        generateInitialAlerts();
        renderAlerts();
        updateMetricsUI();

        // 2. Start Real-Time Simulation (Every 8 seconds)
        if (alertInterval) clearInterval(alertInterval);
        alertInterval = setInterval(() => {
            addNewAlert();
        }, 8000);

        // 3. Attach Listeners (Delegated)
        attachAlertViewListeners();
    }

    function generateInitialAlerts() {
        for (let i = 0; i < 5; i++) {
            alertList.unshift(createAlertObject());
        }
    }

    function createAlertObject() {
        const id = Math.random().toString(36).substr(2, 9).toUpperCase();
        const amount = (Math.random() * 95000 + 500).toFixed(2);
        const riskScore = Math.floor(Math.random() * 100);
        let risk = "low";
        if (riskScore > 80) risk = "high";
        else if (riskScore > 50) risk = "medium";

        return {
            id: `TXN-${id}`,
            amount: `₹${parseFloat(amount).toLocaleString('en-IN')}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            device: devices[Math.floor(Math.random() * devices.length)],
            risk: risk,
            score: riskScore,
            time: "Just Now",
            status: "Pending Investigation",
            reasons: risk === "high" ? ["High-Value Transaction", "New Device Fingerprint", "Location Anomaly"] : ["Regular User Pattern"]
        };
    }

    function addNewAlert() {
        const newAlert = createAlertObject();
        alertList.unshift(newAlert);
        if (alertList.length > 20) alertList.pop(); // Keep list short for performance

        // Update Metrics
        metrics.total++;
        metrics[newAlert.risk]++;

        // Render & Notify
        renderAlerts();
        updateMetricsUI();

        if (newAlert.risk === "high") {
            if (window.ui && window.ui.showToast) {
                window.ui.showToast(`🚨 High Risk Detected: ${newAlert.amount} from ${newAlert.location}`, "error");
            }
        }
    }

    function renderAlerts(filter = "all") {
        const feedBox = document.getElementById('live-feed-box');
        if (!feedBox) return;

        const filtered = filter === "all" ? alertList : alertList.filter(a => a.risk === filter);
        
        if (filtered.length === 0) {
            feedBox.innerHTML = `<div class="p-10 text-center text-secondary italic opacity-50">No ${filter} risk alerts found.</div>`;
            return;
        }

        feedBox.innerHTML = filtered.map(a => `
            <div class="alert-card ${a.risk} animate-fade-in" data-id="${a.id}">
                <div class="card-header">
                    <span>${a.id} • ${a.time}</span>
                    <span class="badge ${a.risk === 'high' ? 'badge-danger' : (a.risk === 'medium' ? 'badge-warning' : 'badge-success')}">${a.risk}</span>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="card-amount">${a.amount}</div>
                        <div class="text-xs text-secondary mt-1"><i data-lucide="map-pin" class="icon-xs inline mr-1"></i> ${a.location}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] font-bold text-secondary uppercase">Risk Score</div>
                        <div class="text-lg font-bold ${a.risk === 'high' ? 'text-danger' : 'text-primary'}">${a.score}%</div>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    function updateMetricsUI() {
        const elTotal = document.querySelector('.count-total');
        const elHigh = document.querySelector('.count-high');
        const elMed = document.querySelector('.count-med');
        const elLow = document.querySelector('.count-low');

        if (elTotal) elTotal.innerText = metrics.total.toLocaleString();
        if (elHigh) elHigh.innerText = metrics.high;
        if (elMed) elMed.innerText = metrics.med;
        if (elLow) elLow.innerText = metrics.low.toLocaleString();
    }

    function showDetails(id) {
        const alert = alertList.find(a => a.id === id);
        if (!alert) return;

        // Highlight Active Card
        document.querySelectorAll('.alert-card').forEach(c => c.classList.remove('active'));
        const activeCard = document.querySelector(`.alert-card[data-id="${id}"]`);
        if (activeCard) activeCard.classList.add('active');

        const detailView = document.getElementById('alert-detail-view');
        if (!detailView) return;

        detailView.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-white">${alert.id}</h3>
                    <p class="text-xs text-secondary">${alert.status}</p>
                </div>
                <span class="badge ${alert.risk === 'high' ? 'badge-danger' : 'badge-success'}">${alert.risk === 'high' ? 'BLOCKED' : 'VERIFIED'}</span>
            </div>

            <div class="detail-item">
                <div class="detail-label">Amount</div>
                <div class="detail-value text-neon-cyan">${alert.amount}</div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${alert.location}</div>
                </div>
                <div>
                    <div class="detail-label">Device</div>
                    <div class="detail-value text-xs">${alert.device}</div>
                </div>
            </div>

            <div class="mb-6">
                <div class="detail-label mb-2">Detection Reasoning</div>
                <ul class="flex flex-col gap-2">
                    ${alert.reasons.map(r => `
                        <li class="p-2 bg-white/5 rounded text-[11px] text-secondary flex items-center gap-2">
                            <i data-lucide="shield-check" class="icon-xs text-brand-cyan"></i> ${r}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="flex gap-2 mt-auto">
                <button class="btn-primary w-full alert-action" data-action="block" data-id="${alert.id}">Block User</button>
                <button class="btn-outline w-full alert-action" data-action="safe" data-id="${alert.id}">Mark Safe</button>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    function attachAlertViewListeners() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.alert-card');
            if (card) {
                showDetails(card.getAttribute('data-id'));
            }

            const filterBtn = e.target.closest('.filter-btn');
            if (filterBtn) {
                const group = filterBtn.closest('.filter-group');
                group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                filterBtn.classList.add('active');
                
                const riskFilter = filterBtn.getAttribute('data-risk');
                if (riskFilter) renderAlerts(riskFilter);
            }

            const actionBtn = e.target.closest('.alert-action');
            if (actionBtn) {
                const action = actionBtn.getAttribute('data-action');
                const id = actionBtn.getAttribute('data-id');
                handleAction(action, id);
            }
        });
    }

    function handleAction(action, id) {
        if (window.ui && window.ui.showToast) {
            const msg = action === 'block' ? `⚠️ User associated with ${id} has been BLOCKED.` : `✅ ${id} marked as SAFE.`;
            window.ui.showToast(msg, action === 'block' ? 'error' : 'success');
        }

        // Simulating processing
        const detailView = document.getElementById('alert-detail-view');
        if (detailView) {
            detailView.innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 text-center text-secondary">
                    <i data-lucide="check-circle" class="icon-lg text-success mb-2"></i>
                    <p class="text-sm font-bold text-white">Action Completed</p>
                    <p class="text-xs">Database updated for ${id}</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    return { initAlerts };
})();
