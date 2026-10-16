const Post = require("../models/Post");
const Like = require("../models/Like");
const logger = require("../utils/logger");

exports.createPost = async (req, res) => {
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

    logger.info("Post created", { postId: post._id, userId: req.user.userId });

    res.status(201).json(post);

  } catch (error) {
    logger.error("Create post failed", { userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    ).populate(
      "author",
      "name username profilePicture"
    );

    if (!post) {
      logger.warn("Get post: post not found", { postId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Post not found"
      });
    }

    const [likesCount, likedByUser] = await Promise.all([
      Like.countDocuments({ post: post._id }),
      Like.exists({ post: post._id, user: req.user.userId })
    ]);

    logger.debug("Post fetched", { postId: post._id, userId: req.user.userId });

    res.json({
      ...post.toObject(),
      likesCount,
      isLiked: !!likedByUser
    });

  } catch (error) {
    logger.error("Get post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      logger.warn("Update post: post not found", { postId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (
      !post.author.equals(req.user.userId)
    ) {
      logger.warn("Update post forbidden: not the author", { postId: post._id, userId: req.user.userId });

      return res.status(403).json({
        message:
          "You can only edit your own posts"
      });
    }

    post.caption = req.body.caption;

    await post.save();

    logger.info("Post updated", { postId: post._id, userId: req.user.userId });

    res.json(post);

  } catch (error) {
    logger.error("Update post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      logger.warn("Delete post: post not found", { postId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (
      !post.author.equals(req.user.userId)
    ) {
      logger.warn("Delete post forbidden: not the author", { postId: post._id, userId: req.user.userId });

      return res.status(403).json({
        message:
          "You can only delete your own posts"
      });
    }

    await post.deleteOne();

    logger.info("Post deleted", { postId: post._id, userId: req.user.userId });

    res.json({
      message: "Post deleted successfully"
    });

  } catch (error) {
    logger.error("Delete post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    const like = await Like.create({
      user: req.user.userId,
      post: req.params.id
    });

    const likesCount = await Like.countDocuments({
      post: req.params.id
    });

    logger.info("Post liked", { postId: req.params.id, userId: req.user.userId, likesCount });

    res.status(201).json({
      message: "Post liked",
      like,
      likesCount
    });

  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Like rejected: already liked", { postId: req.params.id, userId: req.user.userId });

      return res.status(409).json({
        message: "Post already liked"
      });
    }

    logger.error("Like post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const result =
      await Like.findOneAndDelete({
        user: req.user.userId,
        post: req.params.id
      });

    if (!result) {
      logger.warn("Unlike: like not found", { postId: req.params.id, userId: req.user.userId });

      return res.status(404).json({
        message: "Like not found"
      });
    }

    const likesCount = await Like.countDocuments({
      post: req.params.id
    });

    logger.info("Post unliked", { postId: req.params.id, userId: req.user.userId, likesCount });

    res.json({
      message: "Post unliked",
      likesCount
    });

  } catch (error) {
    logger.error("Unlike post failed", { postId: req.params.id, userId: req.user.userId, error: error.message, stack: error.stack });

    res.status(500).json({
      message: error.message
    });
  }
};
