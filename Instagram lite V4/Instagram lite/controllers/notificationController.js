const Notification = require("../models/Notification");
const logger = require("../utils/logger");

exports.getNotifications = async (req, res) => {
  try {
    const recipient = req.user.userId;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient })
        .populate("sender", "name username profilePicture")
        .sort({ createdAt: -1 })
        .limit(50),
      Notification.countDocuments({
        recipient,
        isRead: false
      })
    ]);

    logger.debug("Notifications fetched", {
      userId: recipient,
      count: notifications.length,
      unreadCount
    });

    res.json({
      unreadCount,
      notifications
    });

  } catch (error) {
    logger.error("Get notifications failed", { userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    logger.info("Notifications marked as read", {
      userId: req.user.userId,
      updated: result.modifiedCount
    });

    res.json({
      message: "Notifications marked as read"
    });

  } catch (error) {
    logger.error("Mark notifications as read failed", { userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
