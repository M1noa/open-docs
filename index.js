const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { router: authRouter, isAuthenticated } = require('./routes/auth');
const docsRouter = require('./routes/docs');
// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Create access log stream
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'),
    { flags: 'a' }
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Enhanced request logging middleware
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('user-agent');
    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
    next();
});

// Serve static files from public and docs directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'docs/css')));
app.use('/js', express.static(path.join(__dirname, 'docs/js')));

// Serve static files from dash directory
app.use('/dash', express.static(path.join(__dirname, 'dash')));

// Auth routes
app.use('/auth', authRouter);

// Documentation API routes (protected)
app.use('/docs', isAuthenticated, docsRouter);

// Dashboard route (protected)
app.get('/dash', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dash', 'index.html'));
});

// Documentation routes (public)
app.get('/docs/:id', async (req, res) => {
    const MarkdownIt = require('markdown-it');
    const md = new MarkdownIt();
    try {
        // Read docs.json for every request
        const docsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'docs.json'), 'utf8'));
        const doc = docsData.docs.find(d => d.id === req.params.id);
        
        if (!doc) {
            console.log(`Documentation not found for ID: ${req.params.id}`);
            return res.status(404).send('Documentation not found - No matching doc ID');
        }

        // Log the found documentation details
        console.log(`Serving documentation: ${doc.name} (ID: ${doc.id})`);

        const docPath = path.join(__dirname, 'test-docs', 'README.md');
        const content = await fs.promises.readFile(docPath, 'utf8');
        const htmlContent = md.render(content);

        // Read the template file
        const template = await fs.promises.readFile(path.join(__dirname, 'docs', 'index.html'), 'utf8');
        
        // Replace template variables
        const adjustColorBrightness = (color, amount) => {
            const hex = color.replace('#', '');
            const num = parseInt(hex, 16);
            const r = Math.min(255, Math.max(0, (num >> 16) + amount));
            const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
            const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        };

        const renderedHtml = template
            .replace('${doc.name}', doc.name)
            .replace('${doc.primaryColor || \'#8b5cf6\'}', doc.primaryColor || '#8b5cf6')
            .replace('${doc.primaryColor ? adjustColorBrightness(doc.primaryColor, -20) : \'#7c3aed\'}', 
                doc.primaryColor ? adjustColorBrightness(doc.primaryColor, -20) : '#7c3aed')
            .replace('${doc.customization?.css || \'\'}', doc.customization?.css || '')
            .replace('${htmlContent}', htmlContent);

        // Send the rendered HTML
        res.send(renderedHtml);
    } catch (error) {
        console.error('Error serving documentation:', error);
        res.status(500).send(`Documentation error: ${error.message}`);
    }
});

// Basic routes
app.get('/', (req, res) => {
    const userDataPath = path.join(__dirname, 'db', 'users.json');
    try {
        const data = fs.readFileSync(userDataPath);
        const userData = JSON.parse(data);
        if (!userData.users || userData.users.length === 0) {
            res.redirect('/signup');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/signup');
    }
});

app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - Open-Docs</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">Open-Docs</a>
                </div>
            </nav>

            <main class="container mt-5">
                <div class="auth-container">
                    <h2 class="auth-title">Login</h2>
                    <div id="auth-error" class="auth-error" style="display: none;"></div>
                    <form class="auth-form" id="loginForm">
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </main>

            <script>
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());

                    try {
                        const response = await fetch('/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });

                        const result = await response.json();

                        if (response.ok) {
                            window.location.href = '/dash';
                        } else {
                            const errorDiv = document.getElementById('auth-error');
                            errorDiv.textContent = result.error || 'Login failed';
                            errorDiv.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        const errorDiv = document.getElementById('auth-error');
                        errorDiv.textContent = 'An error occurred. Please try again.';
                        errorDiv.style.display = 'block';
                    }
                });
            </script>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.get('/signup', (req, res) => {
    // Check if user already exists
    const userDataPath = path.join(__dirname, 'db', 'users.json');
    try {
        const data = fs.readFileSync(userDataPath);
        const userData = JSON.parse(data);
        if (userData.users && userData.users.length > 0) {
            return res.redirect('/login');
        }
    } catch (error) {
        // If file doesn't exist, allow signup
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign Up - Open-Docs</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">Open-Docs</a>
                </div>
            </nav>

            <main class="container mt-5">
                <div class="auth-container">
                    <h2 class="auth-title">Sign Up</h2>
                    <div id="auth-error" class="auth-error" style="display: none;"></div>
                    <div id="auth-success" class="auth-success" style="display: none;"></div>
                    <form class="auth-form" id="signupForm">
                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Sign Up</button>
                    </form>
                </div>
            </main>

            <script>
                document.getElementById('signupForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());

                    try {
                        const response = await fetch('/auth/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });

                        const result = await response.json();

                        if (response.ok) {
                            const successDiv = document.getElementById('auth-success');
                            successDiv.textContent = 'Account created successfully! Redirecting to login...';
                            successDiv.style.display = 'block';
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 2000);
                        } else {
                            const errorDiv = document.getElementById('auth-error');
                            errorDiv.textContent = result.error || 'Failed to create account';
                            errorDiv.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        const errorDiv = document.getElementById('auth-error');
                        errorDiv.textContent = 'An error occurred. Please try again.';
                        errorDiv.style.display = 'block';
                    }
                });
            </script>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Give the server a chance to finish pending requests
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server with auto-restart functionality
const startServer = () => {
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
            console.log('Port is busy, retrying in 10 seconds...');
            setTimeout(() => {
                server.close();
                startServer();
            }, 10000);
        }
    });

    return server;
};

startServer();