import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav, Button } from "@primer/react"; // Added Button
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username", repositories: [] });
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:3000/userProfile/${userId}`);
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item aria-current="page" icon={BookIcon} sx={{backgroundColor: "transparent", color: "white"}}>Overview</UnderlineNav.Item>
        <UnderlineNav.Item onClick={() => navigate("/")} icon={RepoIcon} sx={{backgroundColor: "transparent", color: "whitesmoke"}}>Starred Repositories</UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image">
            {/* 👇 SHOW IMAGE IF EXISTS */}
            {userDetails.profileImage ? (
                <img 
                    src={userDetails.profileImage} 
                    alt="Profile" 
                    style={{width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover"}}
                />
            ) : (
                <div style={{fontSize: "50px"}}>👤</div>
            )}
          </div>

          <div className="name">
            <h3>{userDetails.username}</h3>
            <p style={{color: "#8b949e"}}>{userDetails.email}</p>
          </div>

          {/* 👇 SHOW BIO */}
          <div style={{margin: "10px 0", color: "#c9d1d9", fontStyle: "italic"}}>
            {userDetails.description || "No bio available."}
          </div>

          {/* 👇 EDIT BUTTON */}
          <Button onClick={() => navigate("/settings")} style={{width: "100%", marginBottom: "10px"}}>
            Edit Profile
          </Button>

          <div className="follower">
            <p>10 Followers</p>
            <p>3 Following</p>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              setCurrentUser(null);
              window.location.href = "/auth";
            }}
            id="logout"
            style={{marginTop: "20px"}}
          >
            Logout
          </button>
        </div>

        <div className="heat-map-section">
          <HeatMapProfile repos={userDetails.repositories} />
        </div>
      </div>
    </>
  );
};

export default Profile;