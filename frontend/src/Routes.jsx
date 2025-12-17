import React, { useEffect } from "react";
import {useNavigate, useRoutes} from 'react-router-dom'


import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo"; 
import RepoDetails from "./components/repo/RepoDetails";
import IssueDetails from "./components/issue/IssueDetails";
import EditProfile from "./components/user/EditProfile";


import { useAuth } from "./authContext";

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        const userIdFromStorage = localStorage.getItem("userId");

        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

        if(!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname))
        {
            navigate("/auth");
        }

        if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        // {
        //     path:"/dashboard",
        //     element:<Dashboard/>
        // },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path:"/profile",
            element:<Profile/>
        },
        { path: "/create", 
            element: <CreateRepo />
         }, 
        { path: "/repo/:id", 
            element: <RepoDetails />
         } ,
         { path: "/repo/:id/issue/:issueId", 
            element: <IssueDetails /> 
        },
        { path: "/settings", 
            element: <EditProfile /> 
        },
    ]);

    return element;
}

export default ProjectRoutes;