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