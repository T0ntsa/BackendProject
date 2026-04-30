const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../models/Task');
const Dog = require('../models/Dog');
const User = require('../models/User');

// // Home
// const getHome = (req, res) => {
//     res.send('My MVC App');
// }

const objectIdPattern = /^[a-f\d]{24}$/i;

const normalizeObjectId = (value) => {
    if (!value) return null;
    const stringValue = value.toString();
    return objectIdPattern.test(stringValue) ? stringValue : null;
};

const toIdMap = (items) => new Map(items.map((item) => [item._id.toString(), item]));

const userIdOf = (user) => {
    if (!user) return null;
    return (user._id || user.id || "").toString();
};

const canManageTask = (user, task) => {
    if (!user || !task) return false;
    if (user.role === "admin") return true;
    return task.assignedTo?.toString() === userIdOf(user);
};

const hydrateTaskReferences = async (tasks) => {
    const dogIds = [...new Set(tasks.map((task) => normalizeObjectId(task.dog)).filter(Boolean))];
    const userIds = [...new Set(tasks.flatMap((task) => [
        normalizeObjectId(task.assignedTo),
        normalizeObjectId(task.createdBy),
    ]).filter(Boolean))];

    const [dogs, users] = await Promise.all([
        dogIds.length ? Dog.find({ _id: { $in: dogIds } }).select("name breed owner").lean() : [],
        userIds.length ? User.find({ _id: { $in: userIds } }).select("fullName email").lean() : [],
    ]);

    const dogsById = toIdMap(dogs);
    const usersById = toIdMap(users);

    return tasks.map((task) => {
        const dogId = normalizeObjectId(task.dog);
        const assignedToId = normalizeObjectId(task.assignedTo);
        const createdById = normalizeObjectId(task.createdBy);

        return {
            ...task,
            dog: dogId ? (dogsById.get(dogId) || null) : null,
            assignedTo: assignedToId ? (usersById.get(assignedToId) || null) : null,
            createdBy: createdById ? (usersById.get(createdById) || null) : null,
            missingReferences: {
                dog: !dogId && Boolean(task.dog),
                assignedTo: !assignedToId && Boolean(task.assignedTo),
                createdBy: !createdById && Boolean(task.createdBy),
            },
        };
    });
};

// GET /api/tasks
const getTasks = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Request user:", req.user); // Log user details

        const tasks = await Task.find({})
            .sort({ createdAt: -1 })
            .lean();

        return res.json(await hydrateTaskReferences(tasks));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "server error" });
    }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Request user:", req.user); // Log user details

        const { id } = req.params;

        const task = await Task.findById(id)
            .lean();

        if (!task) return res.status(404).json({ msg: "task not found" });

        const hydratedTasks = await hydrateTaskReferences([task]);

        return res.json(hydratedTasks[0]);
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
        console.log("Request body:", req.body); // Log request body
        console.log("Request user:", req.user); // Log user details

        // Check if the user is an admin
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const { title, description, dog, assignedTo, createdBy, status, priority, dueDate } = req.body;

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
            priority,
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
        console.log("Request body:", req.body); // Log request body
        console.log("Request user:", req.user); // Log user details

        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!canManageTask(req.user, task)) {
            return res.status(403).json({ error: "Access denied. You can only update tasks assigned to you." });
        }

        const updates = { ...req.body };
        if (req.user.role !== "admin") {
            delete updates.createdBy;
        }

        task.set(updates);
        const updatedTask = await task.save();

        return res.status(200).json(updatedTask);
    }
    catch (err) {
        return res.status(400).json({ message: 'Failed to update task', error: err.message });
    }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body
        console.log("Request user:", req.user); // Log user details

        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        await task.deleteOne();

        return res.status(200).json({ message: 'Task deleted successfully', task });
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

module.exports = {
    getTasks, 
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
}
