// js/ui.js - General UI Interaction with Dynamic Loading

// --- Component Loader Utility ---
async function loadComponent(containerId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
            // Re-initialize icons for new content
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return true;
        }
    } catch (error) {
        console.error("Component Load Error:", error);
    }
    return false;
}

// Modal Logic
function openModal() {
    const authModal = document.getElementById('auth-modal');
    const appScreen = document.getElementById('app-screen');
    if(authModal) {
        authModal.classList.remove('hidden');
        appScreen.classList.add('blurred');
        setTimeout(() => { authModal.style.opacity = '1'; }, 10);
    }
}

function closeModal() {
    const authModal = document.getElementById('auth-modal');
    const appScreen = document.getElementById('app-screen');
    if(authModal) {
        authModal.style.opacity = '0';
        appScreen.classList.remove('blurred');
        setTimeout(() => { authModal.classList.add('hidden'); }, 300);
    }
}

function showAlert(msg, isError) {
    const authAlert = document.getElementById('auth-alert');
    if(authAlert) {
        authAlert.innerText = msg;
        authAlert.classList.remove('hidden', 'success', 'error');
        authAlert.classList.add(isError ? 'error' : 'success');
    }
}

// View Routing (Dynamic Loading)
async function switchView(target) {
    const profileDropdown = document.getElementById('profile-dropdown');
    if(profileDropdown) profileDropdown.classList.remove('open');

    // Check authentication state from global window.authData
    const isAuthenticated = window.authData ? window.authData.getIsAuthenticated() : false;
    const lockedViews = ['analytics', 'alerts', 'api', 'csv-upload'];

    if (lockedViews.includes(target) && !isAuthenticated) {
        openModal();
        showAlert("Please log in to access this feature.", true);
        return;
    }

    // Load View Content
    const viewContainer = document.getElementById('view-content');
    const success = await loadComponent('view-content', `views/${target}.html`);
    
    if (success) {
        // Apply visual switches to sidebar links
        const sideLinks = document.querySelectorAll('.side-link[data-view]');
        sideLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('data-view') === target) l.classList.add('active');
        });

        // Trigger specific initializations
        if (target === 'dashboard' && window.charts) {
            const instances = window.charts.initCharts();
            if (window.dashboard) window.dashboard.initDashboard(instances);
        }
        
        if (target === 'inference' && window.scanner) {
            window.scanner.initScanner();
        }
        
        if (target === 'csv-upload' && window.csvHandler) {
            window.csvHandler.initCSVHandler();
        }

        // Run counters if present
        const counters = document.querySelectorAll('.counter');
        counters.forEach(c => animateValue(c, 0, parseInt(c.getAttribute('data-target'), 10), 2000));
        
        // Re-attach listeners for new view content
        attachViewListeners();
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if(sidebar) sidebar.classList.remove('open');
    }
}

// Attach listeners to elements that might be loaded dynamically
function attachViewListeners() {
    const viewSwitches = document.querySelectorAll('.view-switch');
    viewSwitches.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn.getAttribute('data-target'));
        });
    });

    const actionSettings = document.querySelectorAll('.action-settings');
    actionSettings.forEach(btn => btn.addEventListener('click', openModal));
}

// Counter Animations
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let val = Math.floor(progress * (end - start) + start);
        const prefix = obj.getAttribute('data-prefix') || '';
        obj.innerHTML = prefix + val.toLocaleString('en-US');
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// Initialization
async function initUI() {
    // 1. Load Permanent Components
    await loadComponent('navbar', 'components/top-nav.html');
    await loadComponent('sidebar', 'components/sidebar.html');
    await loadComponent('auth-modal', 'components/auth-modal.html');
    await loadComponent('quick-scan-modal', 'components/quick-scan-modal.html');
    await loadComponent('complete-profile-modal', 'components/complete-profile-modal.html');

    // 2. Load Initial View
    await switchView('dashboard');

    // 3. Setup Global UI Listeners
    setupGlobalListeners();
}

function setupGlobalListeners() {
    // Sidebar Toggle (Delegated for dynamic content)
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('#sidebar-toggle');
        if (toggle) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('closed');
            }
        }
    });

    // Tab Switching (Delegated to handle dynamic content)
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.id === 'tab-signup') {
            switchAuthTab(false);
        } else if (target.id === 'tab-login') {
            switchAuthTab(true);
        } else if (target.closest('#btn-close-modal')) {
            closeModal();
        } else if (target.closest('#btn-guest')) {
            closeModal();
        } else if (target.closest('#btn-login-drop')) {
            e.preventDefault();
            openModal();
        } else if (target.closest('#profile-trigger')) {
            if (e.target.tagName !== 'A') {
                document.getElementById('profile-dropdown').classList.toggle('open');
            }
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        const profileTrigger = document.getElementById('profile-trigger');
        if (profileTrigger && !profileTrigger.contains(e.target)) {
            const dropdown = document.getElementById('profile-dropdown');
            if(dropdown) dropdown.classList.remove('open');
        }
    });

    // Sidebar View Routing
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.side-link[data-view]');
        if (link) {
            e.preventDefault();
            switchView(link.getAttribute('data-view'));
        }
    });
}

function switchAuthTab(isLogin) {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.querySelector('.field-name');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBtnText = document.getElementById('auth-btn-text');
    const authAlert = document.getElementById('auth-alert');
    const fieldPwd = document.getElementById('field-pwd');
    const authForm = document.getElementById('auth-form');

    if (isLogin) {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        fieldName.classList.add('hidden');
        fieldPwd.classList.remove('hidden');
        document.getElementById('inp-name').required = false;
        document.getElementById('inp-pwd').required = true;
        authTitle.innerText = "Log in to SecurePay-AI";
        authSubtitle.innerText = "Welcome back! Please enter your details.";
        authBtnText.innerText = "Log In";
        authAlert.classList.add('hidden');
        authForm.reset();
        window.uiData.isLoginMode = true;
    } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        fieldName.classList.remove('hidden'); 
        fieldPwd.classList.add('hidden'); 
        document.getElementById('inp-name').required = true;
        document.getElementById('inp-pwd').required = false;
        authTitle.innerText = "Create an Account";
        authSubtitle.innerText = "Enter your details to receive a secure signup link.";
        authBtnText.innerText = "Send Verification Link";
        authAlert.classList.add('hidden');
        authForm.reset();
        window.uiData.isLoginMode = false;
    }
}

// Export functions to window
window.ui = {
    openModal,
    closeModal,
    showAlert,
    switchView,
    initUI,
    loadComponent
};

window.uiData = {
    isLoginMode: true
};
