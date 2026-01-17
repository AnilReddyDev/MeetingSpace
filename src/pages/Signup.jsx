import {  useState } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
export default function Signup() {
    const navigate = useNavigate();
    const [formData,SetFormData] = useState({
        username:"",
        email:"",
        password:"",

    })
    const [error,setError] = useState("")
    

    const formSubmit= async (e)=>{
        e.preventDefault();
        try {
            if(formData.email==""|| formData.password=="" || formData.username==""){
                setError("All fields are mandatory!")
                setTimeout(()=>{setError("")},[4000])
                return;
            }
            const response = await axios.post("http://localhost:8080/api/v1/auth/register",formData);
            // console.log(response)
            navigate("/signin")
            

          } catch (error) {
            console.error("Fetch error: ", error);
            setError("password should be 8 Characters min");

          }
    }


  return (
 <div className="h-screen  w-full flex justify-center items-center  gap-4 bg-hcl-blue-gradient ">
        <form onSubmit={formSubmit}  className={`w-full h-auto mt-5  sm:mt-0 sm:w-auto  px-8 py-4 flex flex-col gap-3   bg-slate-100/35  rounded-md`}>
        <h1 className='text-xl text-center font-semibold'>Sign up</h1>  
        <label>
            <h1 className=' text-sm text-gray-900 font-light pb-1'>User Name</h1>
            <input placeholder='John' value={formData.username} onChange={(e) => SetFormData({...formData,username:e.target.value})} className=' outline-none px-2 border-none rounded-sm w-72 h-10 bg-slate-300/50' type="text" name="name" id="name" />
        </label>
        <label>
            <h1 className=' text-sm text-gray-900 font-light pb-1'>Email</h1>
            <input placeholder='example@gmail.com' value={formData.email} onChange={(e) => SetFormData({...formData,email:e.target.value})} className='outline-none px-2 border-none rounded-sm w-72 h-10 bg-slate-300/50' type="text" name="email" id="email" />
        </label>
         <label>
            <h1 className='text-sm text-gray-900 font-light pb-1'>Password</h1>
            <input placeholder='**********' value={formData.password} onChange={(e) => SetFormData({...formData,password:e.target.value})} className=' outline-none px-2 border-none rounded-sm w-72 h-10 bg-slate-300/50' type="password" name="pass" id="pass" />
        </label>
        <p className='text-center text-sm text-red-900'>{error}</p>

        <button type='submit' className=' text-base font-medium text-gray-950 bg-hcl-gradient rounded-md py-2'>Sign up</button>
        <p className='text-gray-500  text-xs text-center'>or</p>
        <div className='flex gap-1 items-center justify-center'>
            <p className='text-sm font-medium text-gray-500'>Already a user?</p>
            <button className='text-sm font-medium text-blue-500 underline' onClick={()=>navigate("/signin")}>Sign up</button>
        </div>
    </form>
 </div>
  )
}
