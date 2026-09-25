const express = require("express");

const Post = require("../models/Post");
const Like = require("../models/Like");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        image,
        caption
      } = req.body;

      const post = await Post.create({
        author: req.user.userId,
        image,
        caption
      });

      res.status(201).json(post);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.get(
  "/:id",
  async (req, res) => {
    try {
      const post = await Post.findById(
        req.params.id
      ).populate(
        "author",
        "name username profilePicture"
      );

      if (!post) {
        return res.status(404).json({
          message: "Post not found"
        });
      }

      res.json(post);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const post = await Post.findById(
        req.params.id
      );

      if (!post) {
        return res.status(404).json({
          message: "Post not found"
        });
      }

      if (
        !post.author.equals(req.user.userId)
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own posts"
        });
      }

      post.caption = req.body.caption;

      await post.save();

      res.json(post);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const post = await Post.findById(
        req.params.id
      );

      if (!post) {
        return res.status(404).json({
          message: "Post not found"
        });
      }

      if (
        !post.author.equals(req.user.userId)
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own posts"
        });
      }

      await post.deleteOne();

      res.json({
        message: "Post deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.post(
  "/:id/like",
  authMiddleware,
  async (req, res) => {
    try {
      const like = await Like.create({
        user: req.user.userId,
        post: req.params.id
      });

      res.status(201).json({
        message: "Post liked",
        like
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Post already liked"
        });
      }

      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.delete(
  "/:id/like",
  authMiddleware,
  async (req, res) => {
    const result =
      await Like.findOneAndDelete({
        user: req.user.userId,
        post: req.params.id
      });

    if (!result) {
      return res.status(404).json({
        message: "Like not found"
      });
    }

    res.json({
      message: "Post unliked"
    });
  }
);

module.exports = router;