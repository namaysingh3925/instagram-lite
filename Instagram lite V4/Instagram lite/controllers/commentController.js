const Comment = require("../models/Comment");
const logger = require("../utils/logger");

exports.createComment = async (req, res) => {
  try {
    const comment =
      await Comment.create({
        post: req.params.id,
        author: req.user.userId,
        text: req.body.text
      });

    logger.info("Comment created", { commentId: comment._id, postId: req.params.id, userId: req.user.userId });

    res.status(201).json(comment);

  } catch (error) {
    logger.error("Create comment failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.getComments = async (req, res) => {
  try {
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

    logger.debug("Comments fetched", { postId: req.params.id, count: comments.length });

    res.json(comments);

  } catch (error) {
    logger.error("Get comments failed", { postId: req.params.id, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment =
      await Comment.findById(
        req.params.id
      );

    if (!comment) {
      logger.warn("Delete comment: comment not found", { commentId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (
      !comment.author.equals(
        req.user.userId
      )
    ) {
      logger.warn("Delete comment forbidden: not the author", { commentId: comment._id, userId: req.user.userId });

      return res.status(403).json({
        message:
          "You can only delete your own comment"
      });
    }

    await comment.deleteOne();

    logger.info("Comment deleted", { commentId: comment._id, userId: req.user.userId });

    res.json({
      message: "Comment deleted"
    });

  } catch (error) {
    logger.error("Delete comment failed", { commentId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
