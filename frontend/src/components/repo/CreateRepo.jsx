import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { PageHeader, Button, Checkbox } from "@primer/react";
import "./createRepo.css"; 

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true); 
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    try {
      // ✅ LOGIC IS CORRECT: Matches backend route "/repo/create"
      await axios.post("http://localhost:3000/repo/create", {
        owner: userId,
        name: name,
        description: description,
        visibility: visibility,
        content: [],
        issues: []
      });
      console.log("Repo created");
      navigate("/");
    } catch (err) {
      console.error("Error creating repo:", err);
      alert("Failed to create repository. Name might be taken.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper">
        <div className="create-repo-container">
          <PageHeader>
            <PageHeader.TitleArea>
              <PageHeader.Title>Create a new repository</PageHeader.Title>
            </PageHeader.TitleArea>
          </PageHeader>

          <div className="repo-form">
            <div className="form-group">
              <label className="repo-label">Repository Name *</label>
              <input 
                className="repo-input"
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="my-awesome-project"
              />
            </div>

            <div className="form-group">
              <label className="repo-label">Description (optional)</label>
              <textarea 
                className="repo-textarea"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </div>

            <div className="visibility-group">
               <Checkbox 
                  checked={visibility} 
                  onChange={() => setVisibility(!visibility)} 
               />
               <span>Make this repository Public</span>
            </div>

            <Button variant="primary" onClick={handleCreate}>
              Create Repository
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;