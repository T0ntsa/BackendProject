const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');


// Helper function to get token from user and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Get token
    const token = user.getSignedJwtToken();

    // Send response in JSON
    res.status(statusCode).json({
        success: true,
        token,
        // Send basic user data back to the client
        user: { 
            id: user._id, 
            email: user.email,
            fullName: user.fullName, 
            role: user.role,
        }
    });
};

// Handle user signup request (route POST /register)
exports.register = async (req, res) => {
    console.log('Signup attempt received for email:', req.body.email);
    const { fullName, email, password, role } = req.body;

    if (!role || (role !== 'admin' && role !== 'employee')) {
        return res.status(400).json({ success: false, error: 'Invalid role selection.'})
    }

    try {
        // Create user
        const user = await User.create({
            email,
            fullName,
            password,
            role
        });
        return sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Registration error:', err.message);
        if (err.code == 11000) {
            return res.status(400).json({ success: false, error: 'This email is already registerd.' });
        }
        // Response with bad request status & error message
        res.status(400).json({ success: false, error: err.message });
    }
};


// Handle user login request (route POST /login)
exports.login = async (req, res) => {
    console.log('Login attempt received for email:', req.body.email);
    const { email, password } = req.body;
    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password'); // Include password 

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!user || !isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' }); 
        }
       
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' }); // 500 Server error
    }
};