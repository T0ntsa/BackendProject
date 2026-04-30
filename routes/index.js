const express = require('express');
const router = express.Router();

// Home
router.get("/", (req, res) => {
  res.render("index", {
    title: "Homepage",
  });
});

// Login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});

// Tasks
router.get("/tasks", (req, res) => {
  res.render("tasks", { title: "Tasks" });
});

module.exports = router;
