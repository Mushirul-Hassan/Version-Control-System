import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { Button, UnderlineNav } from "@primer/react"; // FIX 1: Replaced TabNav with UnderlineNav
import { RepoIcon, IssueOpenedIcon, CodeIcon, FileIcon } from "@primer/octicons-react";
import "./repoDetails.css"; 

const RepoDetails = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("code"); 
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const repoRes = await axios.get(`http://localhost:3000/repo/${id}`);
        // FIX 2: Corrected URL to match backend route (/issue/all/:id)
        const issuesRes = await axios.get(`http://localhost:3000/issue/all/${id}`);
        
        const repoData = Array.isArray(repoRes.data) ? repoRes.data[0] : repoRes.data;
        
        setRepo(repoData);
        setIssues(issuesRes.data);
      } catch (err) {
        console.error("Error fetching details:", err);
      }
    };
    fetchRepoData();
  }, [id]);

  const handleCreateIssue = async () => {
    if (!newIssueTitle) return;
    try {
        const res = await axios.post(`http://localhost:3000/issue/create/${id}`, {
            title: newIssueTitle,
            description: newIssueDesc
        });
        setIssues([...issues, res.data]);
        setNewIssueTitle("");
        setNewIssueDesc("");
        alert("Issue Created!");
    } catch(err){
        console.error("Error creating issue:", err);
    }
  };

  if (!repo) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="repo-details-wrapper">
        <div className="repo-details-container">
            {/* FIX 3: Replaced PageHeader with custom styling to avoid import errors */}
            <div className="repo-header">
                <RepoIcon size={24} className="fgColor-muted" />
                <h1 className="repo-title">{repo.name}</h1>
                <span className="repo-badge">
                    {repo.visibility ? "Public" : "Private"}
                </span>
            </div>

            <div className="repo-tab-nav">
                {/* FIX 4: Implemented UnderlineNav instead of TabNav */}
                <UnderlineNav aria-label="Repository">
                    <UnderlineNav.Item 
                        aria-current={activeTab === "code" ? "page" : undefined} 
                        onClick={() => setActiveTab("code")}
                        icon={CodeIcon}
                    >
                        Code
                    </UnderlineNav.Item>
                    <UnderlineNav.Item 
                        aria-current={activeTab === "issues" ? "page" : undefined} 
                        onClick={() => setActiveTab("issues")}
                        icon={IssueOpenedIcon}
                        counter={issues.length}
                    >
                        Issues
                    </UnderlineNav.Item>
                </UnderlineNav>
            </div>

            <div className="repo-content">
                {activeTab === "code" && (
                    <div>
                        <h3>Description</h3>
                        <p>{repo.description || "No description available"}</p>
                        
                        <h3>Files</h3>
                        {repo.content && repo.content.length > 0 ? (
                            <ul className="file-list">
                                {repo.content.map((file, index) => (
                                    <li key={index} className="file-item">
                                        <FileIcon className="fgColor-muted" />
                                        <span>{file}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{color: "#8b949e"}}>No files in this repository yet.</p>
                        )}
                    </div>
                )}

                {activeTab === "issues" && (
                    <div>
                        <div className="issue-create-box">
                            <h4>Create New Issue</h4>
                            <input 
                                className="issue-input"
                                type="text" 
                                placeholder="Title" 
                                value={newIssueTitle}
                                onChange={(e)=>setNewIssueTitle(e.target.value)}
                            />
                            <textarea 
                                className="issue-input"
                                placeholder="Description" 
                                value={newIssueDesc}
                                onChange={(e)=>setNewIssueDesc(e.target.value)}
                                style={{minHeight: "80px"}}
                            />
                            <Button variant="primary" onClick={handleCreateIssue}>Submit Issue</Button>
                        </div>

                        <div className="issue-list">
                            {issues.map((issue) => (
                                <div key={issue._id} className="issue-card">
                                    <h4 className="issue-title">
                                        {issue.title} 
                                        <span className={`status-${issue.status}`}>({issue.status})</span>
                                    </h4>
                                    <p className="issue-desc">{issue.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default RepoDetails;