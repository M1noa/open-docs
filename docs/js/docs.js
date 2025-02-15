// Theme management
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = `
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
`;

document.body.appendChild(themeToggle);

// Theme toggle functionality with animation
themeToggle.addEventListener('click', () => {
    document.body.style.transition = 'background-color 0.3s, color 0.3s';
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Set initial theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.remove('dark-mode');
}

// Navigation generation with animations
const generateNavigation = () => {
    const docNav = document.getElementById('doc-nav');
    const headers = document.querySelectorAll('.doc-content h1, .doc-content h2, .doc-content h3');
    const nav = document.createElement('ul');
    nav.className = 'doc-nav';

    headers.forEach((header, index) => {
        const li = document.createElement('li');
        li.className = 'doc-nav-item';
        li.style.opacity = '0';
        li.style.transform = 'translateX(-20px)';
        
        const a = document.createElement('a');
        a.className = 'doc-nav-link';
        a.href = `#${header.id || `section-${index}`}`;
        if (!header.id) header.id = `section-${index}`;
        a.textContent = header.textContent;
        a.style.paddingLeft = `${(header.tagName[1] - 1) * 1}rem`;
        
        li.appendChild(a);
        nav.appendChild(li);

        // Animate nav items
        setTimeout(() => {
            li.style.transition = 'opacity 0.5s, transform 0.5s';
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        }, index * 100);
    });

    docNav.appendChild(nav);
};

// Initialize navigation when content is loaded
document.addEventListener('DOMContentLoaded', () => {
    generateNavigation();
    
    // Add animation classes to content sections
    const sections = document.querySelectorAll('.doc-content > *');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'opacity 0.5s, transform 0.5s';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Smooth scrolling for navigation links
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('doc-nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});