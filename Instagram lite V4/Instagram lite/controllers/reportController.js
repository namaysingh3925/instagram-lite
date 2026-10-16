const Report = require("../models/Report");
const Post = require("../models/Post");
const logger = require("../utils/logger");

exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.warn("Report post: post not found", { postId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.author.equals(req.user.userId)) {
      logger.warn("Report rejected: cannot report own post", { postId: post._id, userId: req.user.userId });

      return res.status(400).json({
        message: "You cannot report your own post"
      });
    }

    // A previously reviewed report goes back into the review queue.
    const reopened = await Report.findOneAndUpdate(
      {
        post: post._id,
        reporter: req.user.userId,
        status: { $ne: "pending" }
      },
      {
        status: "pending",
        $unset: { reviewedBy: 1 }
      }
    );

    if (!reopened) {
      await Report.create({
        post: post._id,
        reporter: req.user.userId
      });
    }

    logger.info(
      reopened ? "Post re-reported, report reopened" : "Post reported",
      { postId: post._id, userId: req.user.userId }
    );

    res.status(201).json({
      message: "Post reported"
    });

  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Report rejected: already reported and pending", { postId: req.params.id, userId: req.user.userId });

      return res.status(409).json({
        message: "You have already reported this post"
      });
    }

    logger.error("Report post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const reports = await Report.find({ status: "pending" })
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "name username profilePicture"
        }
      })
      .populate("reporter", "username")
      .sort({ createdAt: -1 });

    const grouped = new Map();

    for (const report of reports) {
      if (!report.post) {
        continue;
      }

      const key = String(report.post._id);

      if (!grouped.has(key)) {
        grouped.set(key, {
          post: report.post,
          reportCount: 0,
          reporters: [],
          lastReportedAt: report.createdAt
        });
      }

      const entry = grouped.get(key);

      entry.reportCount += 1;
      entry.reporters.push(report.reporter?.username);
    }

    logger.debug("Reported posts fetched", {
      moderatorId: req.user.userId,
      posts: grouped.size
    });

    res.json([...grouped.values()]);

  } catch (error) {
    logger.error("Get reported posts failed", { moderatorId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.markPostSafe = async (req, res) => {
  try {
    const result = await Report.updateMany(
      {
        post: req.params.postId,
        status: "pending"
      },
      {
        status: "safe",
        reviewedBy: req.user.userId
      }
    );

    if (result.matchedCount === 0) {
      logger.warn("Mark safe: no pending reports", { postId: req.params.postId, moderatorId: req.user.userId });

      return res.status(404).json({
        message: "No pending reports for this post"
      });
    }

    logger.info("Post marked as safe", {
      postId: req.params.postId,
      moderatorId: req.user.userId,
      reportsCleared: result.modifiedCount
    });

    res.json({
      message: "Post marked as safe"
    });

  } catch (error) {
    logger.error("Mark post safe failed", { postId: req.params.postId, moderatorId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.deleteReportedPost = async (req, res) => {
  try {
    const pendingCount = await Report.countDocuments({
      post: req.params.postId,
      status: "pending"
    });

    if (pendingCount === 0) {
      logger.warn("Delete reported post: no pending reports", { postId: req.params.postId, moderatorId: req.user.userId });

      return res.status(404).json({
        message: "No pending reports for this post"
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    await Report.updateMany(
      {
        post: req.params.postId,
        status: "pending"
      },
      {
        status: "removed",
        reviewedBy: req.user.userId
      }
    );

    logger.info("Reported post deleted by moderator", {
      postId: req.params.postId,
      moderatorId: req.user.userId,
      reportsCleared: pendingCount
    });

    res.json({
      message: "Post deleted"
    });

  } catch (error) {
    logger.error("Delete reported post failed", { postId: req.params.postId, moderatorId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
