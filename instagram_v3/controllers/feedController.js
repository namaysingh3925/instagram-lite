const Follow = require("../models/Follow");
const Post = require("../models/Post");
const Like = require("../models/Like");

exports.getFeed = async (req, res) => {
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

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, likedByUser] = await Promise.all([
          Like.countDocuments({ post: post._id }),
          Like.exists({ post: post._id, user: userId })
        ]);

        return {
          ...post.toObject(),
          likesCount,
          isLiked: !!likedByUser
        };
      })
    );

    res.json(postsWithLikes);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
