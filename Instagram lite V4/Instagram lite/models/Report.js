const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "safe", "removed"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index(
  {
    reporter: 1,
    post: 1
  },
  {
    unique: true
  }
);

reportSchema.index({
  status: 1,
  post: 1
});

module.exports = mongoose.model("Report", reportSchema);
