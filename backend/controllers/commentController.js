const Comment = require("../models/commentModel");
const Issue = require("../models/issueModel");

async function postComment(req, res) {
  const { issueId } = req.params;
  const { userId, text } = req.body;

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    const newComment = new Comment({
      text,
      user: userId,
      issue: issueId,
    });

    await newComment.save();

    
    const populatedComment = await newComment.populate("user", "username");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error posting comment:", err.message);
    res.status(500).send("Server error");
  }
}

async function getCommentsByIssue(req, res) {
  const { issueId } = req.params;

  try {
    const comments = await Comment.find({ issue: issueId }).populate("user", "username");
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  postComment,
  getCommentsByIssue,
};