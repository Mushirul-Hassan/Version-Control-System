import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { Button, UnderlineNav } from "@primer/react";
import { RepoIcon, IssueOpenedIcon, CodeIcon, FileIcon, StarIcon, StarFillIcon, BookIcon } from "@primer/octicons-react";
import Markdown from 'react-markdown'; // 👈 IMPORT THIS
import "./repoDetails.css"; 

const RepoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [files, setFiles] = useState([]); 
  const [activeTab, setActiveTab] = useState("code"); 
  const [isStarred, setIsStarred] = useState(false);
  
  // Issue State
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");

  // File State
  const [selectedFile, setSelectedFile] = useState(null); 
  const [fileContent, setFileContent] = useState("");     
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [showAddFile, setShowAddFile] = useState(false);

  // README State
  const [readmeContent, setReadmeContent] = useState(null); // 👈 NEW STATE

  useEffect(() => {
    const fetchRepoData = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const repoRes = await axios.get(`http://localhost:3000/repo/${id}`);
        const issuesRes = await axios.get(`http://localhost:3000/issue/all/${id}`);
        const userRes = await axios.get(`http://localhost:3000/userProfile/${userId}`);

        const repoData = Array.isArray(repoRes.data) ? repoRes.data[0] : repoRes.data;
        
        setRepo(repoData);
        setFiles(repoData.content || []); 
        setIssues(issuesRes.data);

        if (userRes.data.starRepos.includes(id)) {
            setIsStarred(true);
        }

        // 👇 NEW: Check for README.md and fetch it
        const readmeFile = repoData.content.find(file => file.name === "README.md" || file.name === "readme.md");
        if (readmeFile) {
            // We have the content directly in the file object if your backend returns it,
            // OR we can fetch it specifically if needed. 
            // Assuming 'repoData.content' includes the content string:
            setReadmeContent(readmeFile.content);
        }

      } catch (err) {
        console.error("Error fetching details:", err);
      }
    };
    fetchRepoData();
  }, [id]);

  const handleStar = async () => {
    const userId = localStorage.getItem("userId");
    try {
        const res = await axios.put(`http://localhost:3000/star/${userId}`, { id: id });
        setIsStarred(res.data.starred);
    } catch (err) {
        console.error("Error starring repo:", err);
    }
  };

  const handleFileClick = async (fileName) => {
    try {
        const res = await axios.get(`http://localhost:3000/repo/file/${id}/${fileName}`);
        setSelectedFile(fileName);
        setFileContent(res.data.content);
    } catch (err) {
        console.error("Error fetching file:", err);
    }
  };

  const handleAddFile = async () => {
    if(!newFileName || !newFileContent) return alert("Please fill details");
    try {
        const res = await axios.post(`http://localhost:3000/repo/file/create/${id}`, {
            name: newFileName,
            content: newFileContent
        });
        setFiles([...files, res.data.file]);
        
        // If user just added a README, show it immediately
        if(res.data.file.name === "README.md") {
            setReadmeContent(res.data.file.content);
        }

        setShowAddFile(false);
        setNewFileName("");
        setNewFileContent("");
        alert("File Added!");
    } catch(err){
        console.error(err);
    }
  };

  const handleCreateIssue = async () => { 
    if (!newIssueTitle) return;
    try {
        const res = await axios.post(`http://localhost:3000/issue/create/${id}`, { title: newIssueTitle, description: newIssueDesc });
        setIssues([...issues, res.data]);
        setNewIssueTitle("");
        setNewIssueDesc("");
        alert("Issue Created!");
    } catch(err){ console.error(err); }
  };

  if (!repo) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="repo-details-wrapper">
        <div className="repo-details-container">
            <div className="repo-header">
                <RepoIcon size={24} className="fgColor-muted" />
                <h1 className="repo-title">{repo.name}</h1>
                <button onClick={handleStar} className="star-btn">
                    {isStarred ? <StarFillIcon fill="#e3b341" /> : <StarIcon />} 
                    {isStarred ? "Starred" : "Star"}
                </button>
            </div>

            <div className="repo-tab-nav">
                <UnderlineNav aria-label="Repository">
                    <UnderlineNav.Item aria-current={activeTab === "code" ? "page" : undefined} onClick={() => setActiveTab("code")} icon={CodeIcon}>Code</UnderlineNav.Item>
                    <UnderlineNav.Item aria-current={activeTab === "issues" ? "page" : undefined} onClick={() => setActiveTab("issues")} icon={IssueOpenedIcon} counter={issues.length}>Issues</UnderlineNav.Item>
                </UnderlineNav>
            </div>

            <div className="repo-content">
                {activeTab === "code" && (
                    <div>
                        {selectedFile ? (
                             <div className="file-viewer">
                                <div className="file-header">
                                    <span style={{fontWeight:"bold"}}>{selectedFile}</span>
                                    <Button onClick={()=>setSelectedFile(null)}>Close</Button>
                                </div>
                                <pre className="code-block">{fileContent}</pre>
                             </div>
                        ) : (
                            <>
                                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}>
                                    <h3>Files</h3>
                                    <Button onClick={()=>setShowAddFile(!showAddFile)} variant="primary">+ Add File</Button>
                                </div>

                                {showAddFile && (
                                    <div className="add-file-box">
                                        <input className="issue-input" placeholder="File Name (e.g., README.md)" value={newFileName} onChange={(e)=>setNewFileName(e.target.value)} />
                                        <textarea className="issue-input" placeholder="Code Content..." value={newFileContent} onChange={(e)=>setNewFileContent(e.target.value)} style={{minHeight:"100px"}} />
                                        <Button variant="primary" onClick={handleAddFile}>Commit New File</Button>
                                    </div>
                                )}

                                <ul className="file-list">
                                    {files.map((file, index) => (
                                        <li key={index} className="file-item" onClick={() => handleFileClick(file.name)}>
                                            <FileIcon className="fgColor-muted" />
                                            <span>{file.name}</span>
                                        </li>
                                    ))}
                                    {files.length === 0 && <p>No files yet.</p>}
                                </ul>

                                {/* 👇 NEW: README Section */}
                                {readmeContent && (
                                    <div className="readme-section">
                                        <div className="readme-header">
                                            <BookIcon className="fgColor-muted" />
                                            <span>README.md</span>
                                        </div>
                                        <div className="readme-body">
                                            <Markdown>{readmeContent}</Markdown>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === "issues" && (
                    <div>
                        <div className="issue-create-box">
                            <input className="issue-input" placeholder="Title" value={newIssueTitle} onChange={(e)=>setNewIssueTitle(e.target.value)} />
                            <textarea className="issue-input" placeholder="Description" value={newIssueDesc} onChange={(e)=>setNewIssueDesc(e.target.value)} />
                            <Button variant="primary" onClick={handleCreateIssue}>Submit Issue</Button>
                        </div>
                        <div className="issue-list">
                            {issues.map((issue) => (
                                <div 
                                    key={issue._id} 
                                    className="issue-card"
                                    onClick={() => navigate(`/repo/${id}/issue/${issue._id}`)} 
                                    style={{cursor: "pointer"}}
                                >
                                    <h4>{issue.title} <span className={`status-${issue.status}`}>({issue.status})</span></h4>
                                    <p>{issue.description}</p>
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