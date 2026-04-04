// js/auth.js - Firebase Authentication & Profile Setup

const firebaseConfig = {
    apiKey: "AIzaSyBavw2AOG6Xtu83YUWqNzOzjQLGU7UnJ1g",
    authDomain: "pay-ai-4745f.firebaseapp.com",
    projectId: "pay-ai-4745f",
    storageBucket: "pay-ai-4745f.firebasestorage.app",
    messagingSenderId: "82512155832",
    appId: "1:82512155832:web:ea85cb118d78fb5fb0104d"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
}

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
let isAuthenticated = false;

// Update UI based on Auth State
function updateAuthUI(user) {
    const avatar = document.getElementById('avatar-img');
    const lockedLinks = document.querySelectorAll('.locked-link');
    const loginDropBtn = document.getElementById('btn-login-drop');
    const logoutBtn = document.getElementById('btn-logout');
    
    // Always track state even if UI isn't loaded yet
    isAuthenticated = !!user;

    if (user) { 
        if(avatar) {
            avatar.src = `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=a855f7&color=fff`;
            avatar.title = `Logged in as ${user.displayName || user.email}`;
        }
        if(loginDropBtn) loginDropBtn.classList.add('hidden');
        if(logoutBtn) logoutBtn.classList.remove('hidden');

        lockedLinks.forEach(link => {
            link.title = "";
            const lockIcon = link.querySelector('.lucide-lock');
            if(lockIcon) lockIcon.style.display = 'none';
            link.classList.remove('locked-link');
        });
        
        if (window.ui && window.ui.closeModal) window.ui.closeModal();
    } else {
        if(avatar) {
            avatar.src = `https://ui-avatars.com/api/?name=Guest&background=06b6d4&color=fff`;
            avatar.title = `Unauthenticated Guest`;
        }
        if(loginDropBtn) loginDropBtn.classList.remove('hidden');
        if(logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Authentication Logic
function initAuth() {
    if (!auth) return;

    auth.onAuthStateChanged((user) => {
        updateAuthUI(user);
    });

    // Detect Magic Link Landing
    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt("Confirm your signup email:");
        }
        if (email) {
            auth.signInWithEmailLink(email, window.location.href)
            .then((result) => {
                // Phase 2: Show "Complete Your Profile" modal
                document.getElementById('complete-profile-modal').classList.remove('hidden');
                document.getElementById('app-screen').classList.add('blurred');
                
                // Pre-fill name from localStorage
                const storedName = window.localStorage.getItem('nameForCompletion');
                if(storedName) document.getElementById('final-name').value = storedName;
            })
            .catch(err => {
                console.error("Magic Link Error:", err);
                if (window.ui && window.ui.showAlert) window.ui.showAlert("Link expired or invalid. Please try again.", true);
            });
        }
    }
}

// Export to window
window.authData = {
    auth,
    getIsAuthenticated: () => isAuthenticated,
    updateAuthUI,
    initAuth
};
