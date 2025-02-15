const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// User data file path
const userDataPath = path.join(__dirname, '..', 'db', 'users.json');

// Ensure users.json exists
if (!fs.existsSync(userDataPath)) {
    fs.writeFileSync(userDataPath, JSON.stringify({ users: [] }));
}

// Helper functions
const readUsers = () => {
    const data = fs.readFileSync(userDataPath);
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userData = readUsers();

        // Check if any user already exists
        if (userData.users.length > 0) {
            return res.status(403).json({ error: 'Admin account already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        userData.users.push({
            id: Date.now().toString(),
            username,
            password: hashedPassword
        });

        writeUsers(userData);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userData = readUsers();
        const user = userData.users.find(u => u.username === username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-jwt-secret',
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({ message: 'Logged in successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Check auth status
router.get('/status', isAuthenticated, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

module.exports = { router, isAuthenticated };