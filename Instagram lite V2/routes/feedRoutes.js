const express = require("express");
const Follow = require("../models/Follow");
const Post = require("../models/Post");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.userId;

      const following =
        await Follow.find({
          follower: userId
        }).select("following");

      const followingIds =
        following.map(
          item => item.following
        );

      const feedUserIds = [
        userId,
        ...followingIds
      ];

      const posts =
        await Post.find({
          author: {
            $in: feedUserIds
          }
        })
        .populate(
          "author",
          "name username profilePicture"
        )
        .sort({
          createdAt: -1
        });

      res.json(posts);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
module.exports = router;