
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
const [isLoggedIn,setIsLoggedIn] = useState(false);
  useEffect(()=>{
        const token = localStorage.getItem("token");
        if(token){
            setIsLoggedIn(true);
        }else{
            setIsLoggedIn(false)
        }
  },[])
  return (
    <div className="min-h-screen w-full bg-hcl-blue-gradient  flex items-center justify-center px-6">

      <div className="max-w-4xl w-full text-center text-white space-y-8">

        {/* Icon / Brand */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-4">
            <Users size={36} className="text-white" />
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Smart Meeting Spaces <br />
          <span className="text-slate-300">For Modern Teams</span>
        </h1>

        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Discover, book, and manage professional meeting rooms designed for
          collaboration, focus, and productivity.
        </p>

        {/* CTA Button */}
        <div className="pt-6">
          <button
            onClick={() => {
                isLoggedIn ? navigate("/home") : navigate("/signin")
            }}
            className="px-10 py-4 rounded-2xl bg-white text-slate-900 font-semibold text-lg hover:bg-slate-200 transition"
          >
            Explore Spaces
          </button>
        </div>

      </div>
    </div>
  );
}
