import React from 'react'
import Login from './pages/login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { AppContext } from './context/AppContext.jsx';
import { AdminContext } from './context/AdminContext';
import Navbar from './compoonents/Navbar.jsx';
import Sidebar from './compoonents/Sidebar.jsx';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard.jsx';
import AllAppointments from './pages/Admin/AllAppointments.jsx';
import AddDoctor from './pages/Admin/AddDoctor.jsx';
import DoctorList from './pages/Admin/DoctorList.jsx';
const App = () => {
  const {aToken} = useContext(AdminContext);

  return aToken?(
    <div className='bg-[#f8f9f]' >
      
      <ToastContainer/>
      <Navbar/>

      <div className='flex items-start' >
        <Sidebar/>
        <Routes>
          <Route path = '/' element={<></>}/>
          <Route path = '/admin-dashboard' element={<Dashboard  />}/>
          <Route path = '/all-appointments' element={<AllAppointments  />}/>
          <Route path = '/add-doctor' element={<AddDoctor  />}/>
          <Route path = '/doctor-list' element={<DoctorList  />}/>
        </Routes>
      </div>

      </div>
  ):(<div>

      <Login />
      <ToastContainer position="top-right" />
    </div>)
}

export default App