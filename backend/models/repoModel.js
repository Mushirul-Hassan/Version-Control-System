const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    content: [
      {
        name: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    
    commits: [
      {
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
      }
    ],
    
    visibility: {
      type: Boolean,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;