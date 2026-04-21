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
}