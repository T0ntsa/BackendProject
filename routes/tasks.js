const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const taskController = require('../controllers/taskController');

const taskRouter = express.Router();

taskRouter.get('/', taskController.getHome); 

taskRouter.get('/tasks/:id', taskController.getTask);

module.exports = taskRouter;