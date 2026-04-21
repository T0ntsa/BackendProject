const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const taskController = require('../controllers/taskController');

const taskRouter = express.Router();

taskRouter.get('/', taskController.getTasks); 

taskRouter.get('/:id', taskController.getTaskById);

module.exports = taskRouter;