import React, { useCallback } from 'react'
import { useState, useContext } from 'react';
import {assets} from '../assets/assets.js';
import { AdminContext } from '../context/AdminContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';


const Login = () => {
    const [state, setState] = useState('Admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {setAToken, backendUrl} = useContext(AdminContext)
    const onSubmitHandler = async (event) => {
event.preventDefault();
try {
  if(state === 'Admin'){
    // const {data} = await axios.post(`${backendUrl}/api/admin/login-admin`, {email, password});
    const {data} = await axios.post(`${backendUrl}/api/admin/login-admin`, {email, password});
    if(data.success){
        localStorage.setItem('aToken', data.token);
        setAToken(data.token)
    }
    else{
        toast.error(error.message || "Invalid credentials: " );
    }
  }}
    catch (error) {
        console.log("Login Error:", error);
        toast.error(error.message || "Invalid credentials: " );
    }

}
  return (
    <form action="" onSubmit={onSubmitHandler} className = "min-h-[80vh] flex items-center justify-center" >
        <div className = "flex flex-col gap-3 auto items-start  p-8 min-w-[340px] sm:min-w-96  border  border-gray-300 rounded-xl text-[#5E5E5E] text-sm shadow-lg ">
                <p className= "text-2xl font-semibold m-auto " >
                     <span className="text-primary">{state} </span>Login

                </p>
                <div className= " w-full" >
                    <p>Email</p>
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" required className="border border-[#DADADA] rounded w-full p-2 mt-1" />
                </div>
                <div className= " w-full" >
                    <p>Password</p>
                    <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" required className="border border-[#DADADA] rounded w-full p-2 mt-1" />
                </div>
                <button type="submit" className="bg-primary text-white rounded w-full py-2 text-base">Login</button>
                {
                    state === 'Admin' ?
                    <p className="text-sm m-auto" >
                      Doctor Login? <span className="text-primary underline cursor-pointer" onClick={() => setState('Doctor')} >Login as Doctor</span>
                      </p> :
                    <p className="text-sm m-auto" >
                       Admin Login? <span className="text-primary underline cursor-pointer" onClick={() => setState('Admin')} >Login as Admin</span>
                     </p>
                }

        </div>
    </form>
  )
}

export default Login