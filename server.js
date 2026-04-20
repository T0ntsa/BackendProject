const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();


const app = express();
// We can can get json data from the client
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Exiting application due to database connection failure.");
    process.exit(1);
  }
};
connectDB();

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
  }),
);

app.set("view engine", "handlebars");
// static files
app.use(express.static("public"));

// import routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Home
app.get("/", (req, res) => {
  res.render("index", {
    title: "Homepage",
  });
});
// About
app.get("/about", (req, res) => {
  res.render("about", {
    title: "List of PERKELE",
  });
});
// This
app.get("/this", (req, res) => {
  res.render("this", {
    title: "this is just this",
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
