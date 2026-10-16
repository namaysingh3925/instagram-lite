const connectDB = require("./db");

const User = require("./models/User");
const Follow = require("./models/Follow");
const Post = require("./models/Post");

async function main() {
  await connectDB();

  const user = await User.findOne({
    username: "rahul123"
  });

  // Step 1:
  // Find users whom Rahul follows

  const following = await Follow.find({
    follower: user._id
  }).select("following");

  const followingIds = following.map(
    item => item.following
  );

  console.log("Following IDs:");
  console.log(followingIds);

  // Step 2:
  // Find posts created by those users

  const posts = await Post.find({
    author: {
      $in: followingIds
    }
  })
    .populate(
      "author",
      "name username profilePicture"
    )
    .sort({
      createdAt: -1
    });

  console.log("Feed:");
  console.log(posts);

  process.exit();
}

main();