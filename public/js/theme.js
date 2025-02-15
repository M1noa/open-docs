function toggleTheme() {
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.classList.toggle('light-theme');
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.bi-moon-stars-fill');
    if (themeIcon) {
        themeIcon.classList.toggle('bi-sun-fill');
        themeIcon.classList.toggle('bi-moon-stars-fill');
    }
}

// Apply theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeIcon = document.querySelector('.bi-moon-stars-fill');
        if (themeIcon) {
            themeIcon.classList.remove('bi-moon-stars-fill');
            themeIcon.classList.add('bi-sun-fill');
        }
    }
});