import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { Button } from "@primer/react";
import "./profile.css"; // Re-use profile CSS

const EditProfile = () => {
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/userProfile/${userId}`);
        setEmail(res.data.email);
        setDescription(res.data.description || "");
        setProfileImage(res.data.profileImage || "");
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/updateProfile/${userId}`, {
        email,
        description,
        profileImage
      });
      alert("Profile Updated!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper"> {/* Reuse wrapper for centering */}
        <div className="create-repo-container" style={{maxWidth: "600px"}}>
          <h2 style={{marginBottom: "20px", borderBottom: "1px solid #30363d", paddingBottom: "10px"}}>
            Public Profile
          </h2>

          <div className="repo-form">
            <div className="form-group">
              <label className="repo-label">Public Email</label>
              <input className="repo-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="repo-label">Bio</label>
              <textarea 
                className="repo-input" 
                style={{minHeight: "100px"}}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Tell us a little bit about yourself"
              />
            </div>

            <div className="form-group">
              <label className="repo-label">Profile Picture URL</label>
              <input 
                className="repo-input" 
                value={profileImage} 
                onChange={(e) => setProfileImage(e.target.value)} 
                placeholder="https://example.com/my-image.png"
              />
              <p style={{fontSize: "12px", color: "#8b949e", marginTop: "5px"}}>
                Paste a direct link to an image (e.g., from Imgur or GitHub).
              </p>
            </div>

            <Button variant="primary" onClick={handleUpdate}>Update Profile</Button>
            <Button onClick={() => navigate("/profile")}>Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;