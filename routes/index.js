const express = require('express');
const router = express.Router();

// Home
router.get("/", (req, res) => {
  res.render("index", {
    title: "Pet Training Manager",
  });
});

// Login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    isAuthPage: true,
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    isAuthPage: true,
  });
});

// Tasks
router.get("/tasks", (req, res) => {
  res.render("tasks", { title: "Tasks" });
});

module.exports = router;
