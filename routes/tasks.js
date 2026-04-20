const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/', taskController.getHome); 

router.get('/task/:id', taskController.getProduct);

module.exports = router;