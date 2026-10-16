const connectDB = require("./db");
const User = require("./models/User");

async function main() {
  await connectDB();

  // CREATE
  const user = await User.create({
    name: "Rahul Sharma",
    username: "rahul123",
    email: "rahul@gmail.com",
    password: "password123",
    bio: "Love travelling"
  });

  console.log("Created user:", user);

  // READ ALL
  const users = await User.find();

  console.log("All users:");
  console.log(users);

  // READ ONE
  const foundUser = await User.findById(user._id);

  console.log("Found user:");
  console.log(foundUser);

  // UPDATE
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      bio: "Love travelling and photography"
    },
    {
      returnDocument: 'after' ,
      runValidators: true
    }
  );

  console.log("Updated user:");
  console.log(updatedUser);

  // DELETE
  const deletedUser = await User.findByIdAndDelete(user._id);

  console.log("Deleted user:");
  console.log(deletedUser);

  process.exit();
}

main();