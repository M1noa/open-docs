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
        const htmlContent = md.render(content);

        // Generate animation styles if enabled
        let animationStyles = '';
        if (doc.customization?.animations?.enabled) {
            const animations = doc.customization.animations;
            animationStyles = `
                <style>
                    .animate-nav { transition: all ${animations.elements.navigation.duration}ms ease-in-out; }
                    .animate-content { transition: all ${animations.elements.content.duration}ms ease-in-out; }
                    .animate-sidebar { transition: all ${animations.elements.sidebar.duration}ms ease-in-out; }
                    
                    .fade-in { opacity: 0; animation: fadeIn ${animations.duration}ms forwards; }
                    .slide-in { transform: translateX(-20px); animation: slideIn ${animations.duration}ms forwards; }
                    
                    @keyframes fadeIn {
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        to { transform: translateX(0); }
                    }
                </style>
            `;
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${doc.name} - Documentation</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="/css/style.css">
                <style>
                    .doc-content { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
                    .doc-content img { max-width: 100%; height: auto; }
                    .doc-content pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; }
                    .doc-content code { background: #f8f9fa; padding: 0.2rem 0.4rem; border-radius: 3px; }
                    ${doc.customization?.css || ''}
                </style>
                ${animationStyles}
                ${doc.customization?.html || ''}
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark animate-nav" style="background-color: ${doc.primaryColor}">
                    <div class="container">
                        <a class="navbar-brand" href="/">${doc.name}</a>
                    </div>
                </nav>
                <div class="doc-content animate-content">
                    ${htmlContent}
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    ${doc.customization?.js || ''}
                    // Initialize animations
                    if (${doc.customization?.animations?.enabled || false}) {
                        document.querySelectorAll('.animate-content').forEach(el => {
                            el.classList.add('fade-in');
                        });
                        document.querySelectorAll('.animate-nav').forEach(el => {
                            el.classList.add('slide-in');
                        });
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