import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm '>
    {/* left */}
    <div>
        <img className='mb-5 w-40' src={assets.logo} alt="" />
        <p className='w-full md:w-2/3 text-gray-600 '>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, odio pariatur nam architecto optio at est, perferendis eius vel odit cupiditate? Numquam saepe fugiat asperiores sequi laudantium blanditiis alias facilis?</p>
    </div>
    {/* center */}
    <div>
        <p className='text-xl font-medium mb-5 '>COMPANY</p>
        <ul className='flex flex-col gap-2 text-gray-600' >
            <li>Home</li>
            <li>About us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
        </ul>
    </div>
    {/* right */}
    <div>
        <p className='text-xl font-medium mb-5 '>Get in Touch</p>
        <ul className='flex flex-col gap-2 text-gray-600' >
            <li>+1-212-456-7890</li>
            <li>abc@gmail.com</li>
        </ul>
    </div>
        </div>
        <div>
            <hr />
            <p className='py-5 text-sm text-center' >Copyright {new Date().getFullYear()}@ Prescripto -All Right Reserved</p>
        </div>
    </div>
  )
}

export default Footer

// 1:48