const connectDB = require("./db");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

async function main() {
  await connectDB();

  const user = await User.findOne({
    username: "rahul123"
  });

  const post = await Post.findOne({
    author: user._id
  });

  // CREATE
  const comment = await Comment.create({
    post: post._id,
    author: user._id,
    text: "Amazing picture!"
  });

  console.log("Created comment:", comment);

  // READ COMMENTS FOR POST
  const comments = await Comment.find({
    post: post._id
  })
    .populate("author", "name username")
    .sort({ createdAt: -1 });

  console.log("Comments:");
  console.log(comments);

  // UPDATE COMMENT
  const updatedComment = await Comment.findByIdAndUpdate(
    comment._id,
    {
      text: "Amazing picture"
    },
    {
      returnDocument: 'after' ,
      runValidators: true
    }
  );

  console.log("Updated comment:", updatedComment);

  // DELETE
  const deletedComment = await Comment.findByIdAndDelete(
    comment._id
  );

  console.log("Deleted comment:", deletedComment);

  process.exit();
}

main();