const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const userDataPath = path.join(__dirname, '..', 'db', 'users.json');

const checkUserExists = () => {
    try {
        const data = fs.readFileSync(userDataPath);
        const userData = JSON.parse(data);
        return userData.users && userData.users.length > 0;
    } catch (error) {
        return false;
    }
};

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    const userExists = checkUserExists();
    const path = req.path;

    // Public routes that don't need redirection
    if (path.startsWith('/css/') || path.startsWith('/js/')) {
        return next();
    }

    // If user is logged in
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
            req.user = decoded;

            // Redirect to dashboard if trying to access auth pages
            if (path === '/login' || path === '/signup' || path === '/') {
                return res.redirect('/dash');
            }
            return next();
        } catch (err) {
            res.clearCookie('token');
        }
    }

    // If no user exists in the system
    if (!userExists) {
        if (path !== '/signup') {
            return res.redirect('/signup');
        }
        return next();
    }

    // If user exists but not logged in
    if (path === '/signup') {
        return res.redirect('/login');
    }
    if (path === '/dash') {
        return res.redirect('/login');
    }
    next();
};

module.exports = authMiddleware;