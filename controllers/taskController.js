const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../models/Task');
// const User = require('../models/User');

// // Home
// const getHome = (req, res) => {
//     res.send('My MVC App');
// }

// GET /api/tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({}); // returns plain JSON objects

        return res.json(tasks);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "server error" });
    }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id).lean();

        if (!task) return res.status(404).json({ msg: "task not found" });

        return res.json(task);
    } catch (err) {
        // common case: invalid ObjectId format
        if (err.name === "CastError") {
        return res.status(400).json({ msg: "invalid task id" });
        }
        console.error(err);
        return res.status(500).json({ msg: "server error" });
    }
};

// POST /api/tasks/create
const createTask = async (req, res) => {
    try {
        const { title, description, dog, assignedTo, createdBy, status, dueDate } = req.body;

        if (!title || !dog || !assignedTo || !createdBy) {
            return res.status(400).json({
                message: 'Missing required fields: title, dog, assignedTo, createdBy',
            });
        }

        const task = await Task.create({
            title,      // is required
            description,
            dog,        // is required
            assignedTo, // is required
            createdBy,  // is required
            status,     // ['pending', 'in_progress', 'completed', 'cancelled'] Default 'pending'
            dueDate,    
        });

        return res.status(201).json({
            message: 'Task created successfully',
            task,
        });
    } 
    catch (err) {
        return res.status(400).json({
            message: 'Failed to create task',
            error: err.message,
        });
    }
};

// UPDATE /api/tasks/:id
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        // // If user is not admin -> 403
        // if (!request.user || request.user.role !== "admin") {
        //     return response.status(403).json({ error: "Access denied. Admins only." });
        // }

        // // Check for token in Authorization header
        // const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return res.status(401).json({ message: 'Missing token' });
        // }
        // const token = authHeader.split(' ')[1];
        // try {
        //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //     req.user = decoded; // token is valid
        // } 
        // catch (err) {
        //     return res.status(401).json({ message: 'Invalid or expired token' });
        // }

        const updates = req.body;

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {
            returnDocument: 'after',
            runValidators: true,
        });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json(updatedTask);
    }
    catch (err) {
        return res.status(400).json({ message: 'Failed to update task', error: err.message });
    }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
    } 
    catch (err) {
        return res.status(400).json({ message: 'Failed to delete task', error: err.message });
    }
};

// List one task FRONTEND
// const getTask = async (req,res) => {
//     try {
//         // console.log("Connected DB:", mongoose.connection.name);
//         // console.log("Looking for id:", req.params.id);

//         const id = req.params.id;
//         const task = await Task.findById(id)
//             .populate("assignedTo")
//             .populate("createdBy");     
//         res.render('server', {
//             task : task.toJSON()
//         });
//     } 
//     catch (err) {
//         console.error(err);
//         res.status(500).json({ msg: "server error" });
//     } 
// }


// List all products

module.exports = {
    getTasks, 
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
}