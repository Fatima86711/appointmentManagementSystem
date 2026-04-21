import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyAppointment = () => {
  const {backendUrl, token, getDoctorData} = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(null); // Track which appointment is loading
  const months = ["","Jan","Feb","Mar","Apr","May","Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"  ]
  
  const slotDateFormat = (slotDate) =>{
    if (!slotDate || typeof slotDate !== 'string') return '';
    const dateArray = String(slotDate).split('_');
    if (dateArray.length !== 3) return slotDate;
    const [day, monthIndexStr, year] = dateArray;
    const monthIndex = Number(monthIndexStr);
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) return slotDate;
    const monthName = months[monthIndex] || monthIndexStr;
    return `${day} ${monthName} ${year}`;
 }

  const getUserAppointments = async () =>{
    try{
      const {data} = await axios.get(backendUrl + '/api/user/appointments', {headers:{token}})
      
      if(data.success){
        setAppointments(data.appointments.reverse());
        console.log(data.appointments)
      }
    }catch(error){
      console.log(error);
      toast.error(error.message)
    }
  }

const cancelAppointment = async (appointmentId) =>{
try{
    const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId},{headers:{token}})
    if(data.success){
      toast.success(data.message);
      getUserAppointments()
      getDoctorData()

    }else{
      toast.error(data.message)
    }

}catch(error){
     console.log(error);
      toast.error(error.message)
    
}
}

// Handle Stripe Payment
const handlePayment = async (appointmentId) => {
  try {
    setPaymentLoading(appointmentId);
    console.log('🔵 handlePayment called for:', appointmentId);
    
    // Step 1: Create Checkout Session on backend
    const { data } = await axios.post(
      backendUrl + '/api/user/create-checkout-session',
      { appointmentId },
      { headers: { token } }
    );
    
    console.log('📤 Backend response:', data);
    
    if (!data.success) {
      console.log('❌ Response not successful');
      toast.error(data.message || 'Failed to create checkout session');
      setPaymentLoading(null);
      return;
    }

    if (!data.sessionId) {
      console.log('❌ No sessionId in response');
      toast.error('No checkout session ID received');
      setPaymentLoading(null);
      return;
    }

    console.log('✅ Session ID received:', data.sessionId);

    // Step 2: Redirect using window.location
    // Format: https://checkout.stripe.com/pay/SESSION_ID
    const checkoutUrl = `https://checkout.stripe.com/pay/${data.sessionId}`;
    console.log('🔗 Redirecting to:', checkoutUrl);
    
    window.location.href = checkoutUrl;

  } catch (error) {
    console.error('❌ Payment error:', error);
    console.error('Error details:', error.response?.data || error.message);
    toast.error(error.response?.data?.message || error.message || 'Payment failed');
    setPaymentLoading(null);
  }
};

  useEffect(() => {
    if(token){
      getUserAppointments();
    }
  }, [token])
  return (
    <div className='pb-3 mt-12 font-medium text-zinc-700 '>
      <p>My Appointments</p>
      <div >
      {appointments.map((item, index)=>(
        <div  className='gird grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index} >
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600 '>
              <p className='text-neutral-800 font-semibold '>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-size-xs' > {item.docData.address.line1}</p>
              <p className='text-size-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time: </span> {slotDateFormat(item.slotData || item.slotDate)}{(item.slotTime? ` | ${item.slotTime}` : '')}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end' >
              {!item.cancelled && !item.payment && <button onClick={() => handlePayment(item._id)} disabled={paymentLoading === item._id} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:text-white hover:bg-primary transition-all duration-300 disabled:opacity-50'>{paymentLoading === item._id ? 'Processing...' : 'Pay Online'}</button>}
              {!item.cancelled && item.payment && <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:text-white hover:bg-green-600 transition-all duration-300 '>✓ Paid</button>}
              {!item.cancelled &&<button onClick={()=> cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border  hover:text-white hover:bg-red-600 transition-all duration-300  ' >Cancel Appointment</button>}
              {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500' > Appointment Cancelled </button> }
            </div>
        </div>
      ))}
      </div>
    </div>
  )
}

export default MyAppointment