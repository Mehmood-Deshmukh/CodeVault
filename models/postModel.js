const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      replies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
    },
  ],
  author: {
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    username: {
        type: String,
        required: true,
    },
    avtar: {
      type: String,
      default: "user",
    },
  },
  tags: {
    type: Array,
    default: [],
  },
  isPublic:{
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);