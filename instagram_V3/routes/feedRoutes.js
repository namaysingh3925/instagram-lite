const express = require("express");
const feedController = require("../controllers/feedController");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  feedController.getFeed
);

module.exports = router;
