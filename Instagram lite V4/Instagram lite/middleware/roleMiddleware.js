const User = require("../models/User");
const logger = require("../utils/logger");

// Must run after authMiddleware. The role is read from the database on each
// request so promoting/demoting a user takes effect without a new token.
function authorizeRoles(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId).select("role");

      if (!user || !allowedRoles.includes(user.role)) {
        logger.warn("Access denied: insufficient role", {
          userId: req.user.userId,
          role: user?.role,
          required: allowedRoles,
          path: req.originalUrl
        });

        return res.status(403).json({
          message: "You do not have permission to perform this action"
        });
      }

      req.user.role = user.role;

      next();

    } catch (error) {
      logger.error("Role check failed", { userId: req.user?.userId, error: error.message, stack: error.stack });

      res.status(500).json({
        message: error.message
      });
    }
  };
}

module.exports = authorizeRoles;
