const express = require("express");

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("moderator"));

router.get(
  "/",
  reportController.getReportedPosts
);

router.put(
  "/posts/:postId/safe",
  reportController.markPostSafe
);

router.delete(
  "/posts/:postId",
  reportController.deleteReportedPost
);

module.exports = router;
