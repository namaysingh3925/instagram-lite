const connectDB = require("./db");
const User = require("./models/User");
const Follow = require("./models/Follow");

async function main() {
  await connectDB();

  const rahul = await User.findOne({
    username: "rahul123"
  });

  const priya = await User.findOne({
    username: "priya123"
  });

  // FOLLOW
  if (rahul._id.equals(priya._id)) {
    console.log("User cannot follow themselves");
    process.exit();
  }

  try {
    const follow = await Follow.create({
      follower: rahul._id,
      following: priya._id
    });

    console.log("Followed:", follow);
  } catch (error) {
    console.log("Already following this user");
  }

  // WHO DOES RAHUL FOLLOW?
  const following = await Follow.find({
    follower: rahul._id
  }).populate("following", "name username");

  console.log("Rahul follows:");
  console.log(following);

  // WHO FOLLOWS PRIYA?
  const followers = await Follow.find({
    following: priya._id
  }).populate("follower", "name username");

  console.log("Priya's followers:");
  console.log(followers);

  // UNFOLLOW
  const unfollowed = await Follow.findOneAndDelete({
    follower: rahul._id,
    following: priya._id
  });

  console.log("Unfollowed:", unfollowed);

  process.exit();
}

main();