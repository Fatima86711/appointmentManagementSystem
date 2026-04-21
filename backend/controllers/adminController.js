import validator from 'validator';
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';

//API for adding doctor
const addDoctor = async(req,res)=>{
    try{
        const {name, email, password, degree, experience,about, fees,address,  speciality} = req.body;
        const imageFile = req.file;
        
       
        console.log({name, email, password, degree, experience,about, fees,address,  speciality},imageFile);
          if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address ){
            return res.status(400).json({success:false,message: "All fields are required"});
          }
           const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            // 2. If found, send an immediate error response
            return res.status(409).json({ // 409 Conflict is a good status code here
                success: false,
                message: "A doctor with this email already exists."
            });
        }
          //status 400 is bad request
          //validating email format
          if(validator.isEmail(email) === false){
            return res.status(400).json({success:false,message: "Invalid email format"});
          }
        //validating strong password
        if(password.length < 8){
            return res.status(400).json({success:false,message: "Password must be at least 8 characters long"});
        }
        //to encrypt password we can use bcryptjs
        //hashing doctor password before saving to db
        const salt = await bcrypt.genSalt(10);// we can use from 1 to 15 number for larger number it will take more time to hash
        const hashedPassword = await bcrypt.hash(password, salt);
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"});
            const imageUrl = imageUpload.secure_url;
            const doctorData = {
                name,
                email,
                image: imageUrl,
                password: hashedPassword,
                speciality,
                degree,
                experience,
                about,
                fees,
                address:JSON.parse(address),
                // address:address,
                date: Date.now()
            };

            const newDoctor = new doctorModel(doctorData);
            if(!newDoctor){
                return res.status(500).json({success:false,message: "Failed to create doctor"});
            }
            await newDoctor.save();
            
            // Save doctorData to the database here
            return res.status(201).json({ success: true, message: "Doctor added successfully", data: doctorData });
    }catch(error){

        console.log(error);
        return res.status(500).json({success:false,message: "Server Error"});
    }

}



// API For Admin Login

const loginAdmin = async(req,res)=>{
try{

    const {email, password} = req.body;
    console.log(email,password);
    
    if( email === process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD){


        const token = jwt.sign( email + password , process.env.JWT_SECRET);
        return res.status(200).json({ success: true, message: "Admin logged in successfully", token });
    }
    else{
        
        return res.status(401).json({success:false,message: "Invalid Password"});
    }

}catch(error){
    console.log(error);
    res.status(500).json({success:false,message: "Server Error"});  


}
}
// API to get all doctors list for admin panal

const allDoctors = async(req,res)=>{
try{
    const doctors = await doctorModel.find({}).select('-password');
    res.json({success:true,doctors});
}catch(error){
console.log(error)
res.json({success:false,message:error.message})
}
}



export {addDoctor, loginAdmin, allDoctors};




