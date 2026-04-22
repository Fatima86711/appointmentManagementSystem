import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) =>{
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');

    // The Bulletproof URL logic
    const rawUrl = import.meta.env.VITE_BACKEND_URL || "";
    const backendUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    
    const [doctors, setDoctors] = useState([]);

    const getAllDoctors = async()=>{
        try{
            const {data} = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
                headers: { atoken: aToken }
            });
            if(data.success){
                setDoctors(data.doctors);
                console.log(data.doctors);
            }else{
                toast.error(data.message)
            }
        }catch(error){
            console.error('getAllDoctors error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const changeAvailability = async(docId)=>{
        try{
            const {data} = await axios.post(`${backendUrl}/api/admin/change-availability`,{docId},{
            headers: { atoken: aToken }
            })
            if(data.success){
                toast.success(data.message);
                getAllDoctors();
            }else{
                toast.error(data.message);
            }
        }catch(error){
                toast.error(error.response?.data?.message || error.message)
            }
        }
        
    const value = {
        aToken, setAToken, backendUrl, doctors, getAllDoctors, changeAvailability
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}
export default AdminContextProvider;