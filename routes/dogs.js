const express = require("express");
const dogController = require("../controllers/dogController");
const { protect } = require("../routes/auth.middleware");

const dogRouter = express.Router();

dogRouter.use(protect); // Apply protect middleware to all routes

dogRouter.post("/", dogController.postDog);
dogRouter.put("/:id", dogController.putDog);
// dogRouter.delete("/:id", dogController.deleteDog);
// dogRouter.get("/", dogController.getAllDogs);

module.exports = dogRouter;
