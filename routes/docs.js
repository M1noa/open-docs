const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// Documentation data file path
const docsDataPath = path.join(__dirname, '..', 'db', 'docs.json');

// Ensure docs.json exists
if (!fs.existsSync(docsDataPath)) {
    fs.writeFileSync(docsDataPath, JSON.stringify({ docs: [] }));
}

// Helper functions
const readDocs = () => {
    const data = fs.readFileSync(docsDataPath);
    return JSON.parse(data);
};

const writeDocs = (docs) => {
    fs.writeFileSync(docsDataPath, JSON.stringify(docs, null, 2));
};

// Get all documentation sites
router.get('/api', (req, res) => {
    try {
        const docsData = readDocs();
        res.json(docsData.docs);
    } catch (error) {
        res.status(500).json({ error: 'Error loading documentation sites' });
    }
});

// Create a new documentation site
router.post('/api', (req, res) => {
    try {
        const { name, repoUrl, branch, directory, token, customCSS, customJS, customHTML, animations, primaryColor } = req.body;
        
        // Validate required fields
        if (!name || !repoUrl || !branch) {
            return res.status(400).json({ error: 'Name, repository URL, and branch are required' });
        }

        const docsData = readDocs();

        const newDoc = {
            id: Date.now().toString(),
            name,
            repoUrl,
            branch,
            directory: directory || '',
            token: token || '',
            primaryColor: primaryColor || '#007bff',
            customization: {
                css: customCSS || '',
                js: customJS || '',
                html: customHTML || '',
                animations: animations || {
                    enabled: false,
                    duration: 300,
                    type: 'fade',
                    elements: {
                        navigation: { type: 'slide', duration: 300 },
                        content: { type: 'fade', duration: 300 },
                        sidebar: { type: 'slide', duration: 300 }
                    }
                }
            }
        };

        docsData.docs.push(newDoc);
        writeDocs(docsData);

        res.status(201).json(newDoc);
    } catch (error) {
        res.status(500).json({ error: 'Error creating documentation site' });
    }
});

// Delete a documentation site
router.delete('/api/:id', (req, res) => {
    try {
        const { id } = req.params;
        const docsData = readDocs();

        docsData.docs = docsData.docs.filter(doc => doc.id !== id);
        writeDocs(docsData);

        res.json({ message: 'Documentation site deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting documentation site' });
    }
});

// Helper function to generate sidebar navigation
const generateSidebar = (basePath, currentPath) => {
    const items = [];
    const files = fs.readdirSync(basePath);

    // Add README.md first if it exists
    if (files.includes('README.md')) {
        items.push({
            name: 'Overview',
            path: './README',
            type: 'file'
        });
    }

    files.forEach(file => {
        const fullPath = path.join(basePath, file);
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(currentPath, fullPath);

        if (file !== 'README.md') {
            if (stat.isDirectory()) {
                items.push({
                    name: file,
                    path: `./${relativePath}`,
                    type: 'directory',
                    items: generateSidebar(fullPath, currentPath)
                });
            } else if (file.endsWith('.md')) {
                items.push({
                    name: file.replace('.md', ''),
                    path: `./${relativePath.replace('.md', '')}`,
                    type: 'file'
                });
            }
        }
    });

    return items;
};

// Serve documentation pages
router.get('/:id/*', async (req, res) => {
    try {
        const { id } = req.params;
        const docsData = readDocs();
        const doc = docsData.docs.find(d => d.id === id);

        if (!doc) {
            return res.status(404).send('Documentation not found');
        }

        const docPath = path.join(__dirname, '..', doc.directory);
        if (!fs.existsSync(docPath)) {
            return res.status(404).send('Documentation directory not found');
        }

        // Get the requested file path from the URL
        let filePath = req.params[0] || 'README.md';
        if (!filePath.endsWith('.md')) {
            filePath += '.md';
        }

        const fullPath = path.join(docPath, filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('Documentation file not found');
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const md = new MarkdownIt();
        // Update markdown links
        const updatedContent = content.replace(/](([^)]+).md)/g, '](./$1)');
        const htmlContent = md.render(updatedContent);

        // Extract headers for on-page navigation
        const headers = [];
        const contentLines = content.split('\n');
        contentLines.forEach(line => {
            const h1Match = line.match(/^# (.+)/);
            const h2Match = line.match(/^## (.+)/);
            if (h1Match) {
                headers.push({ level: 1, text: h1Match[1], id: h1Match[1].toLowerCase().replace(/[^\w]+/g, '-') });
            } else if (h2Match) {
                headers.push({ level: 2, text: h2Match[1], id: h2Match[1].toLowerCase().replace(/[^\w]+/g, '-') });
            }
        });

        // Generate sidebar navigation
        const sidebarItems = generateSidebar(docPath, docPath);

        res.send(`
            <!DOCTYPE html>
            <html lang="en" data-theme="light">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${doc.name} - Documentation</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    :root[data-theme="light"] {
                        --bg-color: #ffffff;
                        --text-color: #333333;
                        --nav-bg: #f8f9fa;
                        --code-bg: #f8f9fa;
                        --border-color: #dee2e6;
                    }
                    
                    :root[data-theme="dark"] {
                        --bg-color: #1a1a1a;
                        --text-color: #e0e0e0;
                        --nav-bg: #2d2d2d;
                        --code-bg: #2d2d2d;
                        --border-color: #404040;
                    }

                    body {
                        background-color: var(--bg-color);
                        color: var(--text-color);
                        transition: background-color 0.3s, color 0.3s;
                    }

                    .navbar {
                        background-color: var(--nav-bg) !important;
                        border-bottom: 1px solid var(--border-color);
                    }

                    .navbar-brand {
                        color: var(--text-color) !important;
                    }

                    .doc-layout {
                        display: flex;
                        min-height: calc(100vh - 56px);
                    }

                    .doc-content {
                        flex: 1;
                        max-width: 800px;
                        margin: 2rem auto;
                        padding: 0 1rem;
                    }

                    .doc-content img { max-width: 100%; height: auto; }
                    .doc-content pre { background: var(--code-bg); padding: 1rem; border-radius: 4px; }
                    .doc-content code { background: var(--code-bg); padding: 0.2rem 0.4rem; border-radius: 3px; }

                    .sidebar {
                        width: 300px;
                        padding: 2rem 1rem;
                        background-color: var(--bg-color);
                        border-left: 1px solid var(--border-color);
                        overflow-y: auto;
                    }

                    .sidebar ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .sidebar li {
                        margin: 0.5rem 0;
                    }

                    .sidebar a {
                        color: var(--text-color);
                        text-decoration: none;
                    }

                    .sidebar a:hover {
                        text-decoration: underline;
                    }

                    .theme-toggle {
                        cursor: pointer;
                        padding: 0.5rem;
                        border: none;
                        background: none;
                        color: var(--text-color);
                    }

                    .on-this-page {
                        width: 250px;
                        padding: 2rem 1rem;
                        background-color: var(--bg-color);
                        border-left: 1px solid var(--border-color);
                        overflow-y: auto;
                        position: sticky;
                        top: 0;
                        height: 100vh;
                    }

                    .on-this-page h3 {
                        font-size: 1rem;
                        font-weight: 600;
                        margin-bottom: 1rem;
                        color: var(--text-color);
                    }

                    .on-this-page ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .on-this-page li {
                        margin: 0.5rem 0;
                        padding-left: 1rem;
                    }

                    .on-this-page li.h2 {
                        padding-left: 1.5rem;
                    }

                    .on-this-page a {
                        color: var(--text-color);
                        text-decoration: none;
                        font-size: 0.9rem;
                        opacity: 0.8;
                        transition: opacity 0.2s;
                    }

                    .on-this-page a:hover {
                        opacity: 1;
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg">
                    <div class="container">
                        <a class="navbar-brand" href="/">${doc.name}</a>
                        <button class="theme-toggle" onclick="toggleTheme()">
                            🌓
                        </button>
                    </div>
                </nav>
                <div class="doc-layout">
                    <div class="sidebar">
                        <ul>
                            ${renderSidebarItems(sidebarItems)}
                        </ul>
                    </div>
                    <div class="doc-content">
                        ${htmlContent}
                    </div>
                    <div class="on-this-page">
                        <h3>On This Page</h3>
                        <ul>
                            ${headers.map(header => `
                                <li class="h${header.level}">
                                    <a href="#${header.id}">${header.text}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <script>
                    // Theme toggle functionality
                    function toggleTheme() {
                        const html = document.documentElement;
                        const currentTheme = html.getAttribute('data-theme');
                        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                        html.setAttribute('data-theme', newTheme);
                        localStorage.setItem('theme', newTheme);
                    }

                    // Load saved theme
                    const savedTheme = localStorage.getItem('theme') || 'light';
                    document.documentElement.setAttribute('data-theme', savedTheme);

                    // Add IDs to headers for anchor links
                    document.querySelectorAll('h1, h2').forEach(header => {
                        if (!header.id) {
                            header.id = header.textContent.toLowerCase().replace(/[^\w]+/g, '-');
                        }
                    });

                    // Smooth scroll to anchor links
                    document.querySelectorAll('.on-this-page a').forEach(anchor => {
                        anchor.addEventListener('click', (e) => {
                            e.preventDefault();
                            const targetId = anchor.getAttribute('href').slice(1);
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    });

                    // Sidebar rendering helper function
                    function renderSidebarItems(items) {
                        return items.map(item => {
                            if (item.type === 'directory') {
                                return \`
                                    <li>
                                        <strong>${item.name}</strong>
                                        <ul>
                                            ${renderSidebarItems(item.items)}
                                        </ul>
                                    </li>
                                \`;
                            } else {
                                return \`
                                    <li>
                                        <a href="${item.path}">${item.name}</a>
                                    </li>
                                \`;
                            }
                        }).join('');
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error serving documentation:', error);
        res.status(500).send('Error loading documentation');
    }
});

module.exports = router;