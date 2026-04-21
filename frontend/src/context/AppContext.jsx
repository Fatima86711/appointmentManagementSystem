import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
//we have created the context
export const AppContext = createContext();


//now the context provider
const AppContextProvider = (props)=>{
const currencySymbol = '$';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const [doctors, setDoctors] = useState([]);
const [token, setToken] =useState(localStorage.getItem('token')?localStorage.getItem('token'):false);
const [ userData,setUserData] = useState(false)


const getDoctorData = async()=>{
    try{
        const {data} = await axios.get(`${backendUrl}/api/doctor/list`);
        if(data.success){
            setDoctors(data.doctors);
            
        }else{
            toast.error(data.message)
        }

    }catch(error){
        console.log(error);
        toast.error(error.response?.data?.message || error.message);
    }
}
const loadUserProfileData = async ()=>{
    try{
        const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{'token':token}})
        if(data.success){
            setUserData(data.userData)
        }else{
            toast.error(data.message)
        }


    }catch(error){
        console.log(error)
        toast.error(error.message)
    }
}

const value = {
doctors,getDoctorData, currencySymbol, setToken, token, backendUrl,userData, setUserData,loadUserProfileData
}



useEffect(()=>{
    getDoctorData();
},[]);
useEffect(()=>{
if(token){
    loadUserProfileData()
}else{
    setUserData(false);
}
},[token])
return (
<AppContext.Provider value={value} >
    {props.children}
</AppContext.Provider>

)

}

export default AppContextProvider;