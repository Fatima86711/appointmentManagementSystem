import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom'
import MyAppointment from './pages/MyAppointment'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Appointment from './pages/Appointment'
import MyProfile from './pages/MyProfile'
import { ToastContainer, toast } from 'react-toastify';
  


function App() {
 
  return (
    <div className="mx-4 sm:mx-[10%]">
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}  />
        
        <Route path='/doctors' element={<Doctors/>}  />
        <Route path='/doctors/:speciality' element={<Doctors/>}  />
        <Route path='/login' element={<Login/>}  />
        <Route path='/about' element={<About/>}  />
        <Route path='/contacts' element={<Contact/>}  />
        <Route path='/my-appointments' element={<MyAppointment/>}  />
        <Route path='/appointment/:docId' element={<Appointment/>}  />
        <Route path='/my-profile' element={<MyProfile/>}  />
      </Routes>
      <Footer/>
    </div>
    
  )
}

export default App
