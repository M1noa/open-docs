const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { router: authRouter, isAuthenticated } = require('./routes/auth');

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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.use('/auth', authRouter);

// Dashboard route (protected)
app.get('/dash', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dash', 'index.html'));
});

// Documentation routes (public)
app.get('/docs/:id', (req, res) => {
    // Documentation pages are public
    res.send('Documentation page for: ' + req.params.id);
});

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});