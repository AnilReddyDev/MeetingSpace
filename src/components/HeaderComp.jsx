
// HeaderComp.jsx
import React, { useEffect, useState } from "react";
import { Users,User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HeaderComp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {

    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); 
    navigate("/signin");
  };

  return (
    <div className="w-full fixed flex justify-between h-16 gap-2 py-2 px-4 bg-slate-200/30 items-center">
      <div
        onClick={() => navigate("/")}
        className="text-2xl flex items-center gap-2 cursor-pointer font-semibold text-slate-200 font-sans"
      >
        <Users color="white" />
        MeetingSpace
      </div>

      <div className="text-md font-login pr-5 cursor-pointer text-white">
        {isLoggedIn ? (
          <p onClick={()=>navigate("/profile")}><User strokeWidth={2.75} /></p>
        ) : (
          <p onClick={() => navigate("/signin")}>Login</p>
        )}
      </div>
    </div>
  );
}
