// js/main.js - Application Entry Point

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Initialize UI (Loads all components and the initial view)
    if (window.ui) {
        await window.ui.initUI();
    }

    // 2. Initialize Auth
    if (window.authData) {
        window.authData.initAuth();
    }

    // 3. Setup Events for Dynamic Content
    setupDynamicEvents();

});

function setupDynamicEvents() {
    // We use document-level listeners or re-check elements because they are dynamic

    document.addEventListener('submit', async (e) => {
        const target = e.target;

        // --- Auth Form Submission ---
        if (target.id === 'auth-form') {
            e.preventDefault();
            const email = document.getElementById('inp-email').value;
            const pwd = document.getElementById('inp-pwd').value;
            const name = document.getElementById('inp-name').value;
            const isLoginMode = window.uiData ? window.uiData.isLoginMode : true;
            const auth = window.authData ? window.authData.auth : null;
            const authBtnText = document.getElementById('auth-btn-text');
            
            if (isLoginMode && email === "admin@gmail.com" && pwd === "1234") {
                if(window.authData) window.authData.updateAuthUI({ email, displayName: 'Admin' });
                if(window.ui) window.ui.showAlert("Admin Login Successful ✅", false);
                return;
            }

            if(!auth) {
                if(window.ui) window.ui.showAlert("Firebase SDK not loaded.", true);
                return;
            }

            authBtnText.innerText = isLoginMode ? 'Logging in...' : 'Sending Link...';

            try {
                if (isLoginMode) {
                    await auth.signInWithEmailAndPassword(email, pwd);
                    if(window.ui) window.ui.showAlert("Login Successful ✅", false);
                } else {
                    let currentUrl = window.location.origin + window.location.pathname;
                    if (currentUrl.includes("127.0.0.1")) currentUrl = currentUrl.replace("127.0.0.1", "localhost");

                    const actionCodeSettings = { url: currentUrl, handleCodeInApp: true };
                    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
                    window.localStorage.setItem('emailForSignIn', email);
                    window.localStorage.setItem('nameForCompletion', name);
                    if(window.ui) window.ui.showAlert("Signup link sent! Check your inbox 📧", false);
                    authBtnText.innerText = 'Check Email';
                }
            } catch (error) {
                console.error(error);
                if(window.ui) window.ui.showAlert(error.message, true);
                authBtnText.innerText = isLoginMode ? 'Log In' : 'Send Verification Link';
            }
        }

        // --- Complete Profile Form ---
        if (target.id === 'complete-profile-form') {
            e.preventDefault();
            const btn = document.getElementById('btn-final-signup');
            const name = document.getElementById('final-name').value;
            const newPwd = document.getElementById('final-pwd').value;
            const auth = window.authData ? window.authData.auth : null;
            const user = auth ? auth.currentUser : null;

            if (user) {
                btn.innerText = "Finalizing...";
                try {
                    await user.updateProfile({ displayName: name });
                    await user.updatePassword(newPwd);
                    document.getElementById('complete-profile-modal').classList.add('hidden');
                    document.getElementById('app-screen').classList.remove('blurred');
                    if(window.ui) window.ui.showAlert("Account fully setup! Welcome ✅", false);
                    if(window.ui) window.ui.openModal();
                    setTimeout(() => { if(window.ui) window.ui.closeModal(); }, 1500);
                } catch (err) {
                    alert(err.message);
                    btn.innerText = "Finish Account Setup";
                }
            }
        }
    });

    document.addEventListener('click', async (e) => {
        const target = e.target;

        // --- Google Sign-In ---
        if (target.closest('#btn-google')) {
            e.preventDefault();
            const auth = window.authData ? window.authData.auth : null;
            if (!auth) return;
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await auth.signInWithPopup(provider);
                if(window.ui) window.ui.showAlert("Google Sign-In Successful ✅", false);
            } catch (error) {
                console.error("Google Auth Error:", error);
                if(window.ui) window.ui.showAlert(error.message, true);
            }
        }

        // --- Logout ---
        if (target.closest('#btn-logout')) {
            e.preventDefault();
            const auth = window.authData ? window.authData.auth : null;
            if(auth) await auth.signOut();
            const dropdown = document.getElementById('profile-dropdown');
            if(dropdown) dropdown.classList.remove('open');
            if(window.authData) window.authData.updateAuthUI(null);
            if(window.ui) window.ui.switchView('dashboard');
        }

        // --- Locked Links ---
        if (target.closest('.locked-link')) {
            const isAuthenticated = window.authData ? window.authData.getIsAuthenticated() : false;
            // Only block if they aren't authenticated AND the item has a data-view or data-target (meaning it's a route)
            const item = target.closest('.locked-link');
            if (!isAuthenticated) {
                e.preventDefault();
                if(window.ui) window.ui.openModal();
                if(window.ui) window.ui.showAlert("Login required to access this feature 🔒", true);
            }
        }

        // --- Razorpay Payment Simulation ---
        if (target.closest('.btn-pay-now')) {
            const btn = target.closest('.btn-pay-now');
            const plan = btn.getAttribute('data-plan');
            const price = btn.getAttribute('data-price');
            
            if (price === "Custom") {
                if(window.ui) window.ui.showAlert("Inquiry sent to Enterprise sales 📧", false);
                return;
            }

            const modal = document.getElementById('razorpay-simulation');
            if (modal) {
                document.getElementById('pay-plan-name').innerText = plan;
                document.getElementById('pay-price').innerText = "₹" + parseInt(price).toLocaleString();
                modal.classList.remove('hidden');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }

        if (target.closest('.btn-close-payment')) {
            const modal = document.getElementById('razorpay-simulation');
            if (modal) modal.classList.add('hidden');
        }

        if (target.id === 'btn-confirm-payment') {
            const btn = target;
            btn.innerText = "Processing Payment...";
            btn.disabled = true;
            setTimeout(() => {
                const modal = document.getElementById('razorpay-simulation');
                if (modal) modal.classList.add('hidden');
                if(window.ui) window.ui.showAlert("Payment Successful! Pro Plan Activated 🚀", false);
                btn.innerText = "Pay Now";
                btn.disabled = false;
            }, 2500);
        }
    });
}
