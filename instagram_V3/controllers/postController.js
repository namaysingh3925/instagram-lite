const Post = require("../models/Post");
const Like = require("../models/Like");

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

    res.status(201).json(post);

  } catch (error) {
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
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const [likesCount, likedByUser] = await Promise.all([
      Like.countDocuments({ post: post._id }),
      Like.exists({ post: post._id, user: req.user.userId })
    ]);

    res.json({
      ...post.toObject(),
      likesCount,
      isLiked: !!likedByUser
    });

  } catch (error) {
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
};

exports.deletePost = async (req, res) => {
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

    res.status(201).json({
      message: "Post liked",
      like,
      likesCount
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
};

exports.unlikePost = async (req, res) => {
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

  const likesCount = await Like.countDocuments({
    post: req.params.id
  });

  res.json({
    message: "Post unliked",
    likesCount
  });
};
