const express = require('express');
const router = express.Router();

// Home
router.get("/", (req, res) => {
  res.render("index", {
    title: "Homepage",
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});

module.exports = router;
