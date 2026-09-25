const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

// =====================================================
// GET /api/users/search?q=rahul
// Search users
// =====================================================

exports.searchUsers = async (req, res) => {
  try {
    const searchText =
      req.query.q?.trim();

    if (!searchText) {
      return res.status(400).json({
        message:
          "Search query is required"
      });
    }

    const users =
      await User.find({
        $or: [
          {
            username: {
              $regex: searchText,
              $options: "i"
            }
          },
          {
            name: {
              $regex: searchText,
              $options: "i"
            }
          }
        ]
      })
      .select(
        "name username profilePicture"
      )
      .limit(20);

    res.json({
      count: users.length,
      users
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to search users"
    });
  }
};

// =====================================================
// GET /api/users/:id
// Get user profile
// =====================================================

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId)
      .select(
        "name username bio profilePicture createdAt"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Get user's posts
    const posts = await Post.find({
      author: userId
    })
      .sort({
        createdAt: -1
      });

    // Count followers
    const followersCount =
      await Follow.countDocuments({
        following: userId
      });

    // Count following
    const followingCount =
      await Follow.countDocuments({
        follower: userId
      });

    // Count posts
    const postsCount =
      await Post.countDocuments({
        author: userId
      });

    // Check whether logged-in user follows
    // this profile
    const isFollowing =
      await Follow.exists({
        follower: req.user.userId,
        following: userId
      });

    res.json({
      user,
      posts,
      postsCount,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get user profile"
    });
  }
};

// =====================================================
// PUT /api/users/:id
// Update own profile
// =====================================================

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Authorization
    if (userId !== req.user.userId) {
      return res.status(403).json({
        message:
          "You can only update your own profile"
      });
    }

    const {
      name,
      bio,
      profilePicture
    } = req.body;

    const user =
      await User.findByIdAndUpdate(
        userId,
        {
          name,
          bio,
          profilePicture
        },
        {
          new: true,
          runValidators: true
        }
      ).select(
        "name username email bio profilePicture"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update profile"
    });
  }
};
