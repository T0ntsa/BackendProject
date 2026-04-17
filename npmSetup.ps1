# Good to have from the get-go
echo 'node_modules
.env' > .gitignore

# Basic .env variables
echo 'DBUSER = ""
DBPASSWORD = ""
DB = ""
CLUSTER = ""
PORT = 3000' > .env

# Make directories for handlebars
mkdir views/layouts, models, controllers

# Handlebars main
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    {{{body}}}
</body>
</html>' > views/layouts/main.handlebars
# Handlebars index
echo '<h1>Welcome H1 title</h1>' > views/index.handlebars


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