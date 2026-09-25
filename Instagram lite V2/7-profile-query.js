const connectDB = require("./db");

const User = require("./models/User");
const Post = require("./models/Post");
const Follow = require("./models/Follow");

async function main() {
  await connectDB();

  const user = await User.findOne({
    username: "rahul123"
  }).select(
    "name username bio profilePicture"
  );

  if (!user) {
    console.log("User not found");
    process.exit();
  }

  // User's posts
  const posts = await Post.find({
    author: user._id
  })
    .sort({
      createdAt: -1
    });

  // Followers count
  const followersCount = await Follow.countDocuments({
    following: user._id
  });

  // Following count
  const followingCount = await Follow.countDocuments({
    follower: user._id
  });

  const profile = {
    user,
    posts,
    postsCount: posts.length,
    followersCount,
    followingCount
  };

  console.log("PROFILE");
  console.log(profile);

  process.exit();
}

main();