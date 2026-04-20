const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../models/Task');


// Home
const getHome = (req, res) => {
    res.send('My MVC App');
}

// List one task
const getTask = async (req,res) => {
    try {
        console.log("Connected DB:", mongoose.connection.name);
        console.log("Looking for id:", req.params.id);

        const id = req.params.id;
        const task = await Task.findById(id);     
        res.render('server', {
            task : task.toJSON()
        });
    } 
    // catch(err) {
    //     res.status(404).json({
    //         msg: "not found"
    //     })   
        
    // } 
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "server error" });
    } 
}


// List all products

module.exports = {
    getHome, 
    getTask
}