const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    image: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 2200,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({
  author: 1,
  createdAt: -1
});

module.exports = mongoose.model("Post", postSchema);