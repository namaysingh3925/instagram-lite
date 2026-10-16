const express = require("express");

const Comment = require("../models/Comment");
const authMiddleware =  require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:id/comments",
  authMiddleware,
  async (req, res) => {
    try {
      const comment =
        await Comment.create({
          post: req.params.id,
          author: req.user.userId,
          text: req.body.text
        });

      res.status(201).json(comment);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.get(
  "/:id/comments",
  async (req, res) => {
    const comments =
      await Comment.find({
        post: req.params.id
      })
      .populate(
        "author",
        "name username profilePicture"
      )
      .sort({
        createdAt: -1
      });

    res.json(comments);
  }
);

router.delete(
  "/comments/:id",
  authMiddleware,
  async (req, res) => {
    const comment =
      await Comment.findById(
        req.params.id
      );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (
      !comment.author.equals(
        req.user.userId
      )
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own comment"
      });
    }

    await comment.deleteOne();

    res.json({
      message: "Comment deleted"
    });
  }
);

module.exports = router;