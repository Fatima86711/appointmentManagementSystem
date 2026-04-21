
import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from "cloudinary"
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;     
        if(!name || !email || !password){
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // validating email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        // validating strong password
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }
        // hashing user password before saving to db
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);   
        const userData = {
            name,
            email,
            password: hashedPassword
        };
       const newUser = new userModel(userData);
        if (!newUser) {
            return res.status(500).json({ success: false, message: "Failed to create user" });
        }
        const user = await newUser.save();
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
        
        res.status(201).json({ success: true, token });

    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message:error.message });
    }   
}

//API for user login
const loginUser = async(req,res)=>{
try{
    const {email, password} = req.body;
    console.log('loginUser received:', req.body);
    const user =await userModel.findOne({email});
    console.log('loginUser: found user?', !!user, 'for email:', email);
    if(!user){
        return res.status(400).json({success:false,message: "Invalid email or password"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('loginUser: password match:', isMatch);
     
    if(isMatch){
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
        res.status(200).json({success:true, token});
    }else{
    return res.status(400).json({success:false,message: "Invalid email or password"});
    
    }
    
}catch(error){
    console.log(error);
    res.status(500).json({success:false,message: error.message});   


}
}
//api to get user profile data
const getProfile = async (req,res)=>{
try{
    const userId = req.userId;
    const userData = await userModel.findById(userId).select('-password')
    res.json({success:true,userData});


}catch(error){
   console.log(error);
   res.json({success:false,message:error.message}) 
}

}
// API to update user profile
const updateProfile = async (req,res) =>{
try{

const {name, phone , address, dob, gender} = req.body;
const userId = req.userId;
const imageFile = req.file;
console.log('updateProfile received:', {userId, name, phone, address, dob, gender}, 'imageFile:', imageFile ? 'yes' : 'no');
if(!name || !phone || !address || !dob || !gender){
    const missing = [];
    if(!name) missing.push('name');
    if(!phone) missing.push('phone');
    if(!address) missing.push('address');
    if(!dob) missing.push('dob');
    if(!gender) missing.push('gender');
    console.log('Missing fields:', missing);
    return res.json({status:400, success:false, message:"Data Missing: " + missing.join(', ')})
}
await userModel.findByIdAndUpdate(userId,{ name,phone, address:JSON.parse(address), dob, gender})
if(imageFile){
    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'});
    const imageURL = imageUpload.secure_url;
    await userModel.findByIdAndUpdate(userId, {image:imageURL})


}
res.json({status:201,success:true, message:"profile updated"})


}catch(error){
    console.log('updateProfile error:', error);
    res.json({status:500,success:false,message:"Server Error"})
}
}

// API to book appointment
const bookAppointment = async( req, res) =>{
    try{
        const {docId, slotDate, slotTime } = req.body;
        const userId = req.userId;
        const docData = await doctorModel.findById(docId).select('-password')
        if(!docData.available){
            return res.json({success:false, message:"Doctor not available"})
        }   
        let slots_booked = docData.slots_booked;
        // checking  slots availablity
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false, message:"Slot not available"})

            }else{
                slots_booked[slotDate].push(slotTime)
            }


        }else{
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime)
        }
        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked;
        const appointmentData = {
            userId, docId, userData, docData, amount:docData.fees, slotTime, slotDate: slotDate, date:Date.now()
        }
        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        //save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId,{slots_booked}) 
        res.json({success:true, message:"Appointment Booked"})



    }catch(error){
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// API to get User Appointments for frontend my-appointment page
const listAppointment = async (req, res) =>{
  try{
    const userId = req.userId;
    const appointments = await appointmentModel.find({userId});
    res.json({success:true, appointments})
  }catch(error){
    console.log(error);
    res.json({success:false, message:error.message})
  }
}
// API to cancel Appointment
const cancelAppointment =async (req, res)=>{
    try{
        // console.log(req.userId)
        const userId  = req.userId;
const { appointmentId} = req.body;


const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }
        
        // 2. Verify appointment user (IMPORTANT FIX: Convert IDs to string for comparison)
        if (appointmentData.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized Action: Not your appointment." });
        }

await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, cancelledAt: Date.now() })
const { docId, slotDate, slotTime } = appointmentData;
const doctorData = 
await doctorModel.findById(docId); 
let slots_booked = doctorData.slots_booked || {};
if (slotDate && slots_booked[slotDate] && Array.isArray(slots_booked[slotDate])) {
    console.log("if condition is reached for slot:", slotDate);
    // Filter out the cancelled slotTime from the array of booked times
    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
}
await doctorModel.findByIdAndUpdate(docId,{slots_booked} )
return res.status(200).json({success:true, message:"Appointment Cancelled"})

    }catch(error){
    console.log(error);
    res.status(500).json({success:false, message:error.message})

    }
}
// 
// const razorpayInstance =new razorpay({
    
// key_id:process.env.RAZORPAY_KEY_ID, 
// key_secret:process.env.RAZORPAY_KEY_SECRET

// })

// // API to create payment of appointment using razor pay.
// const paymentRazorpay = async (req, res) =>{
// const  {appointmentId} = req.body 
// const appointmentData = await appointmentModel.findById(appointmentId);



// }

// Note: JazzCash payment integration removed. Implement other payment providers here (e.g., Razorpay).



export { registerUser, loginUser , getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment };
// 10:36
