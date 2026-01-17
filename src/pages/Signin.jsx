import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function Signin() {
    const navigate = useNavigate();
    const [formData,setFormData] = useState({email:"",password:""});
    const [error,setError] = useState("")
    
    const formSubmit = async (e)=>{
        e.preventDefault();
         try {
            if(formData.email==""|| formData.password==""){
                setError("All field are mandatory!")
                setTimeout(()=>{setError("")},[4000])
                return;
            }
            const response = await axios.post("http://localhost:8080/api/v1/auth/login",formData);
            localStorage.setItem("token",response.data.accessToken);
            // console.log(response.data.accessToken)

            const token = localStorage.getItem("token")
            if(token){
                navigate("/")
            }else{
                setError("something went wrong!! Try again later!")
            }
            

          } catch (error) {
            console.error("Fetch error: ", error);
            setError("email or password is incorrect");

          }
    }
    // console.log(formData)
  return (
 <div className="h-screen  w-full flex justify-center items-center  gap-4 bg-hcl-blue-gradient ">
        <form  onSubmit={formSubmit} className={`w-full h-auto mt-5  sm:mt-0 sm:w-auto  p-8 flex flex-col gap-3   bg-slate-100/35  rounded-md`}>
        <h1 className='text-xl text-center font-semibold'>Welcome to <br /> MeetingSpace</h1>  
        <label>
            <h1 className=' text-sm text-gray-900 font-light pb-1'>Email</h1>
            <input value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} placeholder='example@gmail.com' className='  outline-none px-2 border-none rounded-sm w-72 h-10 bg-slate-300/50' type="text" name="email" id="email" />
        </label>
         <label>
            <h1 className='text-sm text-gray-900 font-light pb-1'>Password</h1>
            <input value={formData.password} onChange={(e)=>setFormData({...formData,password:e.target.value})} placeholder='**********' className=' outline-none px-2 border-none rounded-sm w-72 h-10 bg-slate-300/50' type="password" name="pass" id="pass" />
        </label>
         <p className='text-center text-sm text-red-900'>{error}</p>

        <button type='submit' className=' text-base font-medium text-gray-950 bg-hcl-gradient rounded-md py-2'>Login</button>
        <p className='text-gray-500  text-xs text-center'>or</p>
        <div className='flex gap-1 items-center justify-center'>
            <p className='text-sm font-medium text-gray-500'>New here?</p>
            <button className='text-sm font-medium text-blue-500 underline' onClick={()=>navigate("/signup")}>Sign up</button>
        </div>
    </form>
 </div>
  )
}
