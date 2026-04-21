import jwt from 'jsonwebtoken'
const authUser = (req,res,next)=>{
try{
    const {token} = req.headers;
    if(!token){
        return res.status(401).json({success:false,message: "Unauthorized User"});
//    "Unauthorized," indicating that the request to access a resource was denied because it lacks valid authentication credentials
    } 
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
   req.userId = token_decode.id;
   next();


}catch(error){
    console.log(error);
    res.status(500).json({success:false,message: "Server Error"});


}

    

}

export default authUser;   

