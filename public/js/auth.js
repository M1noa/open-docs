// Theme management
const THEME_KEY = 'theme-preference';
const DARK_CLASS = 'dark-theme';

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.body.classList.toggle(DARK_CLASS, savedTheme === 'dark');
    return savedTheme;
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.body.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    document.body.classList.toggle(DARK_CLASS);
    localStorage.setItem(THEME_KEY, currentTheme);
    
    // Save theme preference to user account if logged in
    if (document.cookie.includes('token')) {
        fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: currentTheme })
        });
    }
}

// Authentication handlers
function handleLogout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    }).then(() => {
        window.location.href = '/login';
    });
}

// Form submission handlers
function handleAuthForm(formId, endpoint) {
    const form = document.getElementById(formId);
    const errorDiv = document.getElementById('auth-error');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        try {
            const formData = new FormData(form);
            const response = await fetch(`/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.location.href = '/dash';
            } else {
                errorDiv.textContent = data.error;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    
    // Setup auth form handlers if present
    if (document.getElementById('loginForm')) {
        handleAuthForm('loginForm', 'login');
    }
    if (document.getElementById('signupForm')) {
        handleAuthForm('signupForm', 'signup');
    }
});