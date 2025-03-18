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

// Insert theme toggle button in the navbar
const navbarNav = document.querySelector('#navbarNav');
navbarNav.insertAdjacentElement('beforebegin', themeToggle);

// Theme toggle functionality
const setTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
};

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    setTheme(newTheme);
});

// Navigation generation
const generateNavigation = () => {
    const docNav = document.getElementById('doc-nav');
    const headers = document.querySelectorAll('.doc-content h1, .doc-content h2');
    const nav = document.createElement('ul');
    nav.className = 'doc-nav';

    let currentSection = null;
    let currentList = nav;

    headers.forEach((header) => {
        const level = parseInt(header.tagName[1]);
        const id = header.id || header.textContent.toLowerCase().replace(/[^\w]+/g, '-');
        if (!header.id) header.id = id;

        const li = document.createElement('li');
        li.className = 'doc-nav-item';

        const a = document.createElement('a');
        a.className = 'doc-nav-link';
        a.href = `#${id}`;
        a.textContent = header.textContent;

        if (level === 1) {
            currentSection = li;
            currentList = nav;
        } else {
            if (!currentSection) return;
            
            if (!currentSection.querySelector('ul')) {
                const ul = document.createElement('ul');
                ul.className = 'doc-nav-nested';
                currentSection.appendChild(ul);
            }
            currentList = currentSection.querySelector('ul');
        }

        li.appendChild(a);
        currentList.appendChild(li);
    });

    docNav.innerHTML = '';
    docNav.appendChild(nav);
};

// Initialize navigation when content is loaded
document.addEventListener('DOMContentLoaded', generateNavigation);

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