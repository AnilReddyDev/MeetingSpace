import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import HeaderComp from "./components/HeaderComp";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <>
   <BrowserRouter>
   <HeaderComp/>
   <Routes>
    <Route path='/' element={<LandingPage/>}/>
    <Route path='/home' element={<Home/>}/>
    <Route path='/signin' element={<Signin/>}/>
    <Route path='/signup' element={<Signup/>}/>
    <Route path="/profile" element={<Profile />} /> 
    <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
     <Route path="/verify" element={<VerifyEmail />} />
   </Routes>
   </BrowserRouter>
    </>
  );
}
