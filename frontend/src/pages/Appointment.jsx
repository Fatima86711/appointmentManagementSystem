import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
    const {docId} = useParams();
    const {doctors, currencySymbol, backendUrl, token, getDoctorData   } = useContext(AppContext);
    const [docInfo, setDocInfo  ] = useState(null);
    const navigate = useNavigate()
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex]  = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const dayOfWeek = ["SUN","MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const getAvailableSlots = async ()=>{
        setDocSlots([]);
        let today = new Date();
        for(let i = 0;i<7; i++){
            let currentDate = new Date(today);
            currentDate.setDate(today.getDate()+i);
            let endTime = new Date();
            endTime.setDate(today.getDate()+i);
            endTime.setHours(21,0,0,0);
            if(today.getDate()===currentDate.getDate()){
                currentDate.setHours(currentDate.getHours()>10?currentDate.getHours() +1:10)
                currentDate.setMinutes(currentDate.getMinutes()>30? 30:0)
            }else{
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }
            let timeSlots = []
            


            while(currentDate<endTime)
            {
                let formattedTime = currentDate.toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})
            let day = currentDate.getDate();
            let month = currentDate.getMonth() + 1;
            let year = currentDate.getFullYear();
            const slotDate = day + "_" + month + "_" + year;
            const slotTime = formattedTime;
            const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime)? false:true;
            if(isSlotAvailable){
 // add slot to array
            timeSlots.push({
                datetime : new Date(currentDate),
                time:formattedTime
            }
            );
            }
            
           

            // Increment current time by 30 minutes
            currentDate.setMinutes(currentDate.getMinutes() + 30)

            
            }
            setDocSlots(prev =>([...prev,timeSlots ]))
        }


    }


    const fetchDocInfo =async () =>{
        const docInfo = doctors.find(doc => doc._id === docId)
        setDocInfo(docInfo)
        console.log( docInfo)
    }

    const bookAppointment = async () =>{
        if(!token){
            toast.warn('Login to Book Appointment.')
            return navigate('/login')
        }
        // Check 1: Ensure a time slot has been selected
    if (!slotTime) { 
        return toast.error("Please select a specific time slot.");
    }
    
    // Check 2: Ensure the chosen day has at least one slot available
    if (!docSlots.length || !docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
        return toast.error("Please select a valid date/day.");
    }
        try{
            const date = docSlots[slotIndex][0].datetime;
            let day = date.getDate();
            
            let month = date.getMonth()+1;
            let year = date.getFullYear();
            const slotDate = day + "_" + month + "_" + year;
            console.log(slotDate);
            const {data } = await axios.post(backendUrl + "/api/user/book-appointment",{docId,slotDate, slotTime}, {headers: {token}})
            if(data.success){
                toast.success(data.message);
                getDoctorData()
                navigate('/my-appointments')
            }else{
                toast.error(data.message);
            }


        }
        catch(error)
        {
            console.log(error)
            toast.error(error.message)
        }

    }


useEffect(()=>{
    fetchDocInfo()
},[doctors,docId])
useEffect(()=>{
getAvailableSlots();
},[docInfo])

useEffect(()=>{
    console.log("These are docSlots",docSlots)
},[docSlots])
  return docInfo && (
    <div>
        {/* Doctor info */}
        <div>
        <div className='flex flex-col sm:flex-row gap-4' >
            
            <div>
                <img className=' bg-primary w-full sm:max-w-72 rounded-lg ' src={docInfo.image} alt="" />
            </div>
            <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0  mt-[-80px] sm:mt-0 '>
                {/* Doc info : name, degree and experience */}
                <p className='flex items-center gap-2 text-2xl font-medium  text-gray-900'>
                    {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
                    </p>
                    <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
                        <p>{docInfo.degree}-{docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full' >{docInfo.experience}</button>
                    </div>
                    {/* About */}
                    <div className='flex flex-col  gap-1 text-sm font-medium text-gray-900 mt-3' >
                        <p className='flex gap-1'>
                            About <img src={assets.info_icon} alt="" />
                        </p>
                        <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
                        <p  className='text-gray-500 font-medium mt-4'>Appointment Fee: <span className='text-gray-600' >{currencySymbol}{docInfo.fees}</span></p>
                    </div>
            </div>
            </div>
            <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700' >
                <p>Booking Slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4' >
                {
                    docSlots.length && docSlots.map((item, index)=>(
                        <div key={index} onClick={()=>setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex==index ? 'bg-primary text-white':'border border-gray-200'} `} >
                            <p  >{item[0] && dayOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>
                    ))
                }
                </div>
                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4' >

                    {
                        
                        docSlots.length && docSlots[slotIndex].map((item,index)=>(
                            
                            <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light   flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time ===slotTime?'bg-primary text-white':'text-gray-400 border border-gray-300'} `} >{item.time.toLowerCase()}</p>
                        ))
                    }
                    {console.log('this is what is not working',docSlots[0])}
                </div>
                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light mt-4 px-14 py-3 rounded-full' >Make an Appointment</button>
            </div>
        </div>
        <RelatedDoctors docId ={docId} speciality = {docInfo.speciality} />

    </div>
  )
}

export default Appointment


// 2:27