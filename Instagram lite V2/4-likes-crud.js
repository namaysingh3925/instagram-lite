const connectDB = require("./db");
const User = require("./models/User");
const Post = require("./models/Post");
const Like = require("./models/Like");

async function main() {
  await connectDB();

  const user = await User.findOne({
    username: "rahul123"
  });

  const post = await Post.findOne({
    author: user._id
  });

  // LIKE
  try {
    const like = await Like.create({
      user: user._id,
      post: post._id
    });

    console.log("Post liked:", like);
  } catch (error) {
    console.log("Already liked this post");
  }

  // CHECK LIKE
  const existingLike = await Like.findOne({
    user: user._id,
    post: post._id
  });

  console.log(
    "User liked this post:",
    !!existingLike
  );

  // COUNT LIKES
  const likeCount = await Like.countDocuments({
    post: post._id
  });

  console.log("Like count:", likeCount);

  // UNLIKE
  const deletedLike = await Like.findOneAndDelete({
    user: user._id,
    post: post._id
  });

  console.log("Unliked:", deletedLike);

  process.exit();
}

main();