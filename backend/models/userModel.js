const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    // 👇 NEW FIELDS
    profileImage: {
      type: String, 
      default: "" // Stores URL or Base64 string
    },
    description: {
      type: String,
      default: "" // User Bio
    },
    // ----------------
    repositories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        default: [],
      },
    ],
    followedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    starRepos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        default: [],
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;