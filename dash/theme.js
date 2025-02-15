// Theme management
const modes = {
    'light': {
        background: '#e4daeb',
        surface: 'rgba(75, 73, 82, 0.1)',
        text: '#0f172a',
        textSecondary: '#475569'
    },
    'dark': {
        background: '#0f172a',
        surface: 'rgba(30, 41, 59, 0.7)',
        text: '#e2e8f0',
        textSecondary: '#94a3b8'
    }
};

const accentColors = {
    'green': {
        primary: '#10b981',
        secondary: '#34d399'
    },
    'yellow': {
        primary: '#fbbf24',
        secondary: '#fcd34d'
    },
    'blue': {
        primary: '#3b82f6',
        secondary: '#60a5fa'
    },
    'purple': {
        primary: '#8b5cf6',
        secondary: '#a78bfa'
    },
    'red': {
        primary: '#ef4444',
        secondary: '#f87171'
    }
};

let currentMode = 'dark';
let currentAccentColor = 'purple';

// Load saved preferences from localStorage
const savedMode = localStorage.getItem('theme-mode') || 'dark';
const savedColor = localStorage.getItem('theme-color') || 'purple';

// Initialize theme with saved preferences
setMode(savedMode);
setAccentColor(savedColor);

// Add event listeners for theme controls when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => setAccentColor(btn.dataset.color));
    });
});

function setMode(modeName) {
    const mode = modes[modeName];
    const root = document.documentElement;
    currentMode = modeName;
    localStorage.setItem('theme-mode', modeName);
    
    root.style.setProperty('--background', mode.background);
    root.style.setProperty('--surface', mode.surface);
    root.style.setProperty('--text', mode.text);
    root.style.setProperty('--text-secondary', mode.textSecondary);

    // Update active state of mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === modeName);
    });
}

function setAccentColor(colorName) {
    const color = accentColors[colorName];
    const root = document.documentElement;
    currentAccentColor = colorName;
    localStorage.setItem('theme-color', colorName);
    
    root.style.setProperty('--primary', color.primary);
    root.style.setProperty('--secondary', color.secondary);

    // Update active state of color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === colorName);
    });
}