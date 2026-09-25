const connectDB = require("./db");
const User = require("./models/User");
const Post = require("./models/Post");

async function main() {
  await connectDB();

  const user = await User.findOne({
    username: "rahul123"
  });

  // CREATE POST
  const post = await Post.create({
    author: user._id,
    image: "https://example.com/goa.jpg",
    caption: "Beautiful sunset in Goa"
  });

  console.log("Created post:", post);

  // READ ALL POSTS
  const posts = await Post.find();

  console.log("All posts:");
  console.log(posts);

  // READ POST WITH AUTHOR
  const postWithAuthor = await Post.findById(post._id)
    .populate("author");

  console.log("Post with author:");
  console.log(postWithAuthor);

  // UPDATE
  const updatedPost = await Post.findByIdAndUpdate(
    post._id,
    {
      caption: "Beautiful sunset in Goa"
    },
    {
      returnDocument: 'after' ,
      runValidators: true
    }
  );

  console.log("Updated post:", updatedPost);

  // DELETE
  const deletedPost = await Post.findByIdAndDelete(post._id);

  console.log("Deleted post:", deletedPost);

  process.exit();
}

main();