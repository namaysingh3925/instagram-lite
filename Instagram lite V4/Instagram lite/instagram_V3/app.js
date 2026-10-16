const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/feed",feedRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", followRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Instagram Lite API is running"
  });
});

module.exports = app;