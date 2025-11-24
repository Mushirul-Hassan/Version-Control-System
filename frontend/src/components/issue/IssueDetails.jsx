import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { Button, PageHeader } from "@primer/react";
import "./issueDetails.css"; 
import { API_URL } from "../../config";

const IssueDetails = () => {
  const { id, issueId } = useParams(); // id = repoId, issueId = issueId
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Issue Details
        const issueRes = await axios.get(`${API_URL}/issue/${issueId}`);
        setIssue(issueRes.data);

        // 2. Fetch Comments
        const commentsRes = await axios.get(`${API_URL}/comment/${issueId}`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Error fetching issue/comments:", err);
      }
    };
    fetchData();
  }, [issueId]);

  const handlePostComment = async () => {
    const userId = localStorage.getItem("userId");
    if (!newComment) return;

    try {
        const res = await axios.post(`${API_URL}/comment/post/${issueId}`, {
            userId,
            text: newComment
        });
        // Add new comment to list immediately
        setComments([...comments, res.data]);
        setNewComment("");
    } catch(err) {
        console.error("Error posting comment:", err);
    }
  };

  if (!issue) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="issue-details-wrapper">
        <div className="issue-details-header">
            <div className="header-top">
                <h1>{issue.title} <span className="issue-number">#{issueId.slice(-4)}</span></h1>
                <Button onClick={() => navigate(`/repo/${id}`)}>Back to Repo</Button>
            </div>
            <div className="status-badge-row">
                <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
                <span className="meta-text"> opened this issue on {new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
        </div>

        <div className="comment-thread">
            {/* Original Issue Description as first comment */}
            <div className="comment-box">
                <div className="comment-header">
                    <strong>Original Post</strong>
                </div>
                <div className="comment-body">
                    <p>{issue.description}</p>
                </div>
            </div>

            {/* Comments List */}
            {comments.map((comment) => (
                <div key={comment._id} className="comment-box">
                    <div className="comment-header">
                        <strong>{comment.user?.username || "Unknown"}</strong> commented on {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="comment-body">
                        <p>{comment.text}</p>
                    </div>
                </div>
            ))}

            {/* New Comment Form */}
            <div className="comment-input-area">
                <textarea 
                    placeholder="Leave a comment" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="comment-actions">
                    <Button variant="primary" onClick={handlePostComment}>Comment</Button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default IssueDetails;