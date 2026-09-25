const express = require("express");

const userController = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET /api/users/search?q=rahul
// Search users
// =====================================================

router.get(
  "/search",
  authMiddleware,
  userController.searchUsers
);

// =====================================================
// GET /api/users/:id
// Get user profile
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  userController.getUserProfile
);

// =====================================================
// PUT /api/users/:id
// Update own profile
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  userController.updateUserProfile
);

module.exports = router;
