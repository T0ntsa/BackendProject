const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const fs = require('fs');
require('dotenv').config();

const app = express();
// We can can get json data from the client
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
}));

app.set('view engine', 'handlebars');
// static files
app.use(express.static('public'));

// Home
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Homepage'
    });
});
// About
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'List of PERKELE'
    });
});
// This
app.get('/this', (req, res) => {
    res.render('this', {
        title: 'this is just this'
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
