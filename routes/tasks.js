const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();
const taskController = require('../controllers/taskController');
const taskRouter = express.Router();

// Get all tasks
taskRouter.get('/', taskController.getTasks); 
// Get task by id
taskRouter.get('/:id', taskController.getTaskById);
// Create a task
taskRouter.post('/create', taskController.createTask);
// Update a task
taskRouter.patch('/:id', taskController.updateTask);
// Delete task
taskRouter.delete('/:id', taskController.deleteTask);


module.exports = taskRouter;