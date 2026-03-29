document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize Icons
    lucide.createIcons();

    // Elements
    const authScreen = document.getElementById('auth-screen');
    const authForm = document.getElementById('auth-form');
    const logoutBtn = document.getElementById('btn-logout');

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.querySelector('.field-name');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBtnText = document.getElementById('auth-btn-text');
    const authAlert = document.getElementById('auth-alert');
    
    let isLoginMode = true;

    // Toggle Tabs
    tabSignup.addEventListener('click', () => {
        isLoginMode = false;
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        fieldName.classList.remove('hidden');
        document.getElementById('inp-name').required = true;
        authTitle.innerText = "Create an Account";
        authSubtitle.innerText = "Sign up to access SecurePay-AI enterprise dashboard.";
        authBtnText.innerText = "Sign Up";
        authAlert.classList.add('hidden');
        authForm.reset();
    });

    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        fieldName.classList.add('hidden');
        document.getElementById('inp-name').required = false;
        authTitle.innerText = "Log in to SecurePay-AI";
        authSubtitle.innerText = "Welcome back! Please enter your details.";
        authBtnText.innerText = "Authenticate";
        authAlert.classList.add('hidden');
        authForm.reset();
    });

    function showAlert(msg, isError) {
        authAlert.innerText = msg;
        authAlert.classList.remove('hidden', 'success', 'error');
        authAlert.classList.add(isError ? 'error' : 'success');
    }

    // Auth Logic
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('inp-email').value;
        const pwd = document.getElementById('inp-pwd').value;
        const name = document.getElementById('inp-name').value;

        // Fetch users from LocalStorage
        let users = JSON.parse(localStorage.getItem('securepay_users')) || [];

        if (isLoginMode) {
            // LOGIN LOGIC
            const user = users.find(u => u.email === email && u.password === pwd);
            if (!user) {
                showAlert("Invalid email or password. Are you signed up?", true);
                return;
            }
            
            // Set Avatar Tooltip
            const avatar = document.getElementById('avatar-img');
            if(avatar) avatar.title = `Logged in as ${user.name || user.email}`;
            
            authBtnText.innerText = 'Authenticating...';
            setTimeout(() => {
                authScreen.style.opacity = '0';
                setTimeout(() => {
                    authScreen.classList.add('hidden');
                    document.body.classList.remove('showing-auth');
                    initDashboardFeatures();
                }, 400);
            }, 800);
        } else {
            // SIGNUP LOGIC
            const exists = users.find(u => u.email === email);
            if (exists) {
                showAlert("An account with this email already exists.", true);
                return;
            }
            users.push({ name, email, password: pwd });
            localStorage.setItem('securepay_users', JSON.stringify(users));
            showAlert("Account created successfully! Please log in.", false);
            
            // Auto switch to login
            setTimeout(() => { tabLogin.click(); }, 1500);
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authScreen.classList.remove('hidden');
        document.body.classList.add('showing-auth');
        setTimeout(() => {
            authScreen.style.opacity = '1';
            authBtnText.innerText = 'Authenticate';
            authForm.reset();
            document.getElementById('profile-dropdown').classList.remove('open');
        }, 50);
    });

    // Profile Dropdown
    const profileTrigger = document.getElementById('profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    profileTrigger.addEventListener('click', (e) => {
        if(e.target.tagName === 'A') return;
        profileDropdown.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (!profileTrigger.contains(e.target)) {
            profileDropdown.classList.remove('open');
        }
    });

    // View Routing
    const sideLinks = document.querySelectorAll('.side-link');
    const views = document.querySelectorAll('.view');
    const viewSwitches = document.querySelectorAll('.view-switch');

    function switchView(target) {
        sideLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.side-link[data-view="${target}"]`);
        if(activeLink) activeLink.classList.add('active');
        
        views.forEach(v => {
            v.classList.add('hidden');
            v.classList.remove('active-view');
            if(v.id === `view-${target}`) {
                v.classList.remove('hidden');
                setTimeout(() => { v.classList.add('active-view'); }, 50);
            }
        });
        
        profileDropdown.classList.remove('open');
    }

    sideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.getAttribute('data-view'));
        });
    });

    viewSwitches.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn.getAttribute('data-target'));
        });
    });

    // Animate Counters (Count-up effect)
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let val = Math.floor(progress * (end - start) + start);
            
            const prefix = obj.getAttribute('data-prefix') || '';
            obj.innerHTML = prefix + val.toLocaleString('en-IN');
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    let dashboardInited = false;
    let liveChartInstance = null;
    let alertInterval = null;

    function initDashboardFeatures() {
        if(dashboardInited) return;
        dashboardInited = true;

        // 1. Counter Animations
        const counters = document.querySelectorAll('.counter');
        counters.forEach(c => {
            const target = parseInt(c.getAttribute('data-target'), 10);
            animateValue(c, 0, target, 2500); 
        });

        // 2. Initial Setup for Live Chart
        const ctx = document.getElementById('liveChart').getContext('2d');
        
        const labels = Array.from({length: 15}, (_, i) => {
            const d = new Date();
            d.setSeconds(d.getSeconds() - (15 - i) * 3);
            return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        });
        
        const dataSafe = Array.from({length: 15}, () => Math.floor(Math.random() * 50) + 100);
        const dataFraud = Array.from({length: 15}, () => Math.floor(Math.random() * 10));

        liveChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Safe TXN',
                        data: dataSafe,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Blocked Fraud',
                        data: dataFraud,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointBackgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: {family: "'JetBrains Mono', monospace"} } }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', maxTicksLimit: 5 }
                    }
                }
            }
        });

        // Live updater interval
        setInterval(() => {
            if(!document.getElementById('view-dashboard').classList.contains('active-view')) return; // Save resources

            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            liveChartInstance.data.labels.push(time);
            liveChartInstance.data.labels.shift();
            
            liveChartInstance.data.datasets[0].data.push(Math.floor(Math.random() * 50) + 100);
            liveChartInstance.data.datasets[0].data.shift();
            
            const isSpike = Math.random() > 0.8;
            liveChartInstance.data.datasets[1].data.push(isSpike ? Math.floor(Math.random() * 20)+15 : Math.floor(Math.random() * 5));
            liveChartInstance.data.datasets[1].data.shift();
            
            liveChartInstance.update('none'); 
            
            updateRiskGauge(isSpike);

        }, 3000);

        // 3. Fake Realtime Alert Generator
        const alertTypes = [
            { title: "Velocity Alert: Same IP detected", loc: "Delhi, IN", amt: "₹45,000", critical: true },
            { title: "Unusual Merchant Category check", loc: "Moscow, RU", amt: "$890", critical: false },
            { title: "High-value from unregistered device", loc: "Mumbai, IN", amt: "₹1,20,000", critical: true },
            { title: "Multiple failed verification attempts", loc: "London, UK", amt: "£45", critical: false },
            { title: "Geolocation Mismatch detected", loc: "New York, US", amt: "$2,400", critical: true }
        ];

        const alertsBox = document.getElementById('alerts-box');
        
        function addAlert() {
            const al = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            
            const div = document.createElement('div');
            div.className = `alert-item ${al.critical ? 'critical' : ''}`;
            div.innerHTML = `
                <div class="alert-item-header">
                    <span>${time} - ${al.loc}</span>
                    <span class="${al.critical ? 'text-danger' : 'text-warning'}">${al.amt}</span>
                </div>
                <div class="alert-title">${al.title}</div>
            `;
            
            alertsBox.prepend(div);
            if(alertsBox.children.length > 5) {
                alertsBox.removeChild(alertsBox.lastChild);
            }
        }

        addAlert(); addAlert(); addAlert();
        
        alertInterval = setInterval(() => {
            if(document.getElementById('view-dashboard').classList.contains('active-view')) {
                if(Math.random() > 0.4) addAlert();
            }
        }, 4500);
    }

    function updateRiskGauge(isSpike) {
        const gaugeFill = document.getElementById('risk-gauge');
        const gaugeVal = document.getElementById('risk-val');
        
        const score = isSpike ? Math.floor(Math.random() * 35) + 40 : Math.floor(Math.random() * 12) + 8;
        
        const degrees = (score / 100) * 180;
        gaugeFill.style.transform = `rotate(${degrees}deg)`;
        gaugeVal.innerText = `${score}%`;
        
        if(score > 30) {
            gaugeFill.classList.add('high-risk');
            gaugeVal.classList.add('text-danger');
        } else {
            gaugeFill.classList.remove('high-risk');
            gaugeVal.classList.remove('text-danger');
        }
    }

    // ML Scanner (Inference Engine Logic)
    const btnRunInference = document.getElementById('btn-run-inference');
    if(btnRunInference) {
        btnRunInference.addEventListener('click', () => {
            const rawJson = document.getElementById('json-input').value;
            let data;
            
            try {
                data = JSON.parse(rawJson);
            } catch(e) {
                alert("Invalid JSON format");
                return;
            }

            document.getElementById('inference-empty').classList.add('hidden');
            document.getElementById('inference-result').classList.add('hidden');
            document.getElementById('inference-loading').classList.remove('hidden');

            setTimeout(() => {
                document.getElementById('inference-loading').classList.add('hidden');
                document.getElementById('inference-result').classList.remove('hidden');

                let riskScore = 12;
                if(data.amount && data.amount > 100000) riskScore += 45;
                if(data.distance_km && data.distance_km > 500) riskScore += 25;
                if(data.merchant_category && (data.merchant_category === 'crypto' || data.merchant_category === 'gambling')) riskScore += 30;

                riskScore = Math.min(riskScore + Math.floor(Math.random()*10), 99);

                const elScore = document.getElementById('r-score');
                const elAction = document.getElementById('r-action');
                const elJson = document.getElementById('r-json');

                elScore.innerText = riskScore;
                if(riskScore > 60) {
                    elScore.className = "text-danger";
                    elAction.className = "text-danger mt-2 font-bold";
                    elAction.innerText = "ACTION: BLOCK";
                } else {
                    elScore.className = "text-success";
                    elAction.className = "text-success mt-2 font-bold";
                    elAction.innerText = "ACTION: ALLOW";
                }

                const responsePayload = {
                    id: "txn_" + Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString(),
                    risk_score: riskScore,
                    recommended_action: riskScore > 60 ? "BLOCK" : "ALLOW",
                    latency_ms: Math.floor(Math.random() * 40) + 120,
                    applied_rules: riskScore > 60 ? ["amount_threshold", "velocity_check"] : []
                };

                elJson.innerText = JSON.stringify(responsePayload, null, 2);
                
                lucide.createIcons();

            }, 1200);
        });
    }

    // Payment Gateway Simulator Logic (XAI Demo)
    const simForm = document.getElementById('sim-form');
    if(simForm) {
        simForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amt = parseInt(document.getElementById('sim-amt').value, 10);
            const loc = document.getElementById('sim-loc').value;
            
            document.getElementById('sim-result').classList.add('hidden');
            document.getElementById('sim-loading').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('sim-loading').classList.add('hidden');
                document.getElementById('sim-result').classList.remove('hidden');
                
                let score = 5;
                let reasons = [];
                
                if (amt > 50000) {
                    score += 45;
                    reasons.push("➤ Anomaly: Transaction amount (₹" + amt.toLocaleString() + ") exceeds user's historical daily average by 400%.");
                }
                
                if (loc.toLowerCase().includes('ru') || loc.toLowerCase().includes('cn') || loc.toLowerCase().includes('ng')) {
                    score += 35;
                    reasons.push("➤ Geolocation alert: High-risk zone detected (" + loc + ") deviating from home network.");
                }
                
                if (amt % 1000 === 0 && amt > 10000) {
                    score += 10;
                    reasons.push("➤ Pattern match: Unusually perfectly rounded high-value transaction (common cash-out behavior).");
                }

                if(reasons.length === 0) {
                    reasons.push("✓ No anomalous behavior detected. Checkout velocity normal. Device fingerprinted successfully.");
                }

                document.getElementById('xai-score').innerText = score;
                const actionBadge = document.getElementById('xai-action');
                
                if (score > 65) {
                    actionBadge.className = "badge badge-danger";
                    actionBadge.innerText = "BLOCKED";
                    document.getElementById('xai-score').className = "font-bold text-danger";
                } else if (score > 30) {
                    actionBadge.className = "badge badge-warning";
                    actionBadge.innerText = "FLAGGED FOR REVIEW";
                    document.getElementById('xai-score').className = "font-bold text-warning";
                } else {
                    actionBadge.className = "badge badge-success";
                    actionBadge.innerText = "APPROVED";
                    document.getElementById('xai-score').className = "font-bold text-success";
                }
                
                document.getElementById('xai-reasons').innerHTML = reasons.join("<br><br>");
                
            }, 1500); // 1.5s simulated heavy processing
        });
    }

});
