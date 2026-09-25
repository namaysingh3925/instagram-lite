const express = require("express");

const Follow = require("../models/Follow");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();


router.post(
  "/:id/follow",
  authMiddleware,
  async (req, res) => {
    try {
      const followerId = req.user.userId;
      const followingId = req.params.id;

      if (followerId === followingId) {
        return res.status(400).json({
          message:
            "You cannot follow yourself"
        });
      }

      const follow =
        await Follow.create({
          follower: followerId,
          following: followingId
        });

      res.status(201).json({
        message: "User followed",
        follow
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "You are already following this user"
        });
      }

      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.delete(
  "/:id/follow",
  authMiddleware,
  async (req, res) => {
    const result =
      await Follow.findOneAndDelete({
        follower: req.user.userId,
        following: req.params.id
      });

    if (!result) {
      return res.status(404).json({
        message: "Follow relationship not found"
      });
    }

    res.json({
      message: "User unfollowed"
    });
  }
);

module.exports = router;