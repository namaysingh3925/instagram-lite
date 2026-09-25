const express = require("express");

const followController = require("../controllers/followController");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();


router.post(
  "/:id/follow",
  authMiddleware,
  followController.followUser
);

router.delete(
  "/:id/follow",
  authMiddleware,
  followController.unfollowUser
);

module.exports = router;
