const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('../models/Task');

// Home
const getHome = (req, res) => {
    res.send('My MVC App');
}

// List one product
const getTask = async (req,res) => {
    try {
        const id = req.params.id;
        const product = await Task.findById(id);     
        res.render('server', {
            task : task.toJSON()
        });
    }
    catch(err) {
        res.status(404).json({
            msg: "not found"
        })   
    }  
}


// List all products

module.exports = {
    getHome, 
    getTask
}