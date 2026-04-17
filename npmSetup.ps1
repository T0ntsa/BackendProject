# Good to have from the get-go
echo 'node_modules
.env' > .gitignore

# Basic .env variables
echo 'DBUSER = ""
DBPASSWORD = ""
DB = ""
CLUSTER = ""
PORT = 3000' > .env

# Make needed directories
mkdir views/layouts, models, controllers, public

# style.css
echo 'body {
    font-family: Arial, sans-serif;
    margin: 20px;
    background-color: #f0f0f0;
}
.nav ul {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: flex;
    gap: 42px;
}
.nav a {
    text-decoration-thickness: 3px; 
    text-decoration-color: rgb(147, 179, 255);
    text-decoration-style: dashed;
    padding: 8px 12px;
    border-radius: 8px;
}
.nav a:hover {
  background-color: rgb(147, 179, 255); /* highlight */
  color: #0b1b3a;                       /* readable text on highlight */
  text-decoration-color: #0b1b3a;       /* underline changes too */
}' > public/style.css

# Handlebars main
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/style.css">
    <title>{{title}}</title>
</head>
<body>
    <nav class="nav">
        <ul>
            <li><a href="/">home</a></li>
            <li><a href="/this">this</a></li>
            <li><a href="/about">about</a></li>
        </ul>
    </nav>
    {{{body}}}
</body>
</html>' > views/layouts/main.handlebars
# Handlebars index
echo '<h1>Welcome H1 title</h1>' > views/index.handlebars

# Handlebars about
echo "<p>Hello, you are in about page</p>" > views/about.handlebars

# Handlebars this (FOR SOMETHING)
echo "<p>Hello, you are in this page</p>" > views/this.handlebars

# Create index.js
echo "const express = require('express');
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
    console.log(``Server is running on port `${PORT}``);
});" > index.js

### Start of the Node.js + packages ###
# -y = YES to all promts
npm init -y

# Add scripts "dev": "nodemon index" -> npm dev run
npm pkg set scripts.dev="nodemon index"

# Packages
npm i nodemon --save-dev | 
npm i express | 
npm i express-handlebars | 
npm i dotenv | 
npm i mongoose