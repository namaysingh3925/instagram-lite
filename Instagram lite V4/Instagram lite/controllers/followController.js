const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

async function notifyUser(req, type, recipientId) {
  const notification = await Notification.create({
    recipient: recipientId,
    sender: req.user.userId,
    type
  });

  await notification.populate(
    "sender",
    "name username profilePicture"
  );

  req.app
    .get("io")
    .to(String(recipientId))
    .emit("notification", notification);

  logger.debug("Notification emitted", {
    notificationId: notification._id,
    type,
    recipientId: String(recipientId),
    senderId: req.user.userId
  });
}

exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.id;

    if (followerId === followingId) {
      logger.warn("Follow rejected: cannot follow self", { userId: followerId });

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

    await notifyUser(req, "follow", followingId);

    logger.info("User followed", { followerId, followingId });

    res.status(201).json({
      message: "User followed",
      follow
    });

  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Follow rejected: already following", { followerId: req.user.userId, followingId: req.params.id });

      return res.status(409).json({
        message:
          "You are already following this user"
      });
    }

    logger.error("Follow user failed", { followerId: req.user.userId, followingId: req.params.id, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const result =
      await Follow.findOneAndDelete({
        follower: req.user.userId,
        following: req.params.id
      });

    if (!result) {
      logger.warn("Unfollow: follow relationship not found", { followerId: req.user.userId, followingId: req.params.id });

      return res.status(404).json({
        message: "Follow relationship not found"
      });
    }

    await notifyUser(req, "unfollow", req.params.id);

    logger.info("User unfollowed", { followerId: req.user.userId, followingId: req.params.id });

    res.json({
      message: "User unfollowed"
    });

  } catch (error) {
    logger.error("Unfollow user failed", { followerId: req.user.userId, followingId: req.params.id, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
