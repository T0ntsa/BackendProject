const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('./auth.middleware');

const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login)
authRouter.get('/trainers', protect, authController.getTrainers);


module.exports = authRouter;
