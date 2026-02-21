import { User } from "../models/users.model.js";

const cookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:"None",
    maxAge: 5 * 24 * 60 * 60 * 1000
}

export const registerUser  = async(req,res)=>{
    try {
        const { username , name , email , password  } = req.body;

        if(!username || !name  || !email || !password ){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        let user = await User.findOne({username});
        if(user){
            return res.status(400).json({
                success:false,
                message:"The username already exists."
            })
        }

        const emailExists = await User.findOne({email});

        if(emailExists){
            return res.status(400).json({
                success:false,
                message : "The email already exists."
            })
        }

        user = await User.create({username, name , email , password });

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Failed to create user"
            })
        }

        const token = await user.generateJWTToken();

        res.cookie("token",token,cookieOptions);
        

        user.password = undefined;

        res.status(200).json({
            sucess:true,
            message:"user created successfully",
            user,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

export const loginUser = async(req,res)=>{
   try {
        const {email , password }= req.body;

        if(!email || !password ){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        const user = await User.findOne({email}).select(+"password");

        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({
                success:false,
                message:"Email or password is incorrect."
            })
        }

        const token = await user.generateJWTToken();

        res.cookie("token",token,cookieOptions);

        user.password = undefined;

        res.status(200).json({
            success:true,
            message:"User logged In successfully.",
            user,
        })
   } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
   }
    
}

export const logoutUser = async(req,res)=>{
    try {
        res.cookie("token","",{
            httpOnly:true,
            sameSite:"None",
            expires:new Date(0),
            secure:true
        })


        res.status(200).json({
            success:true,
            message:"Logout Successfully."
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const searchUser = async(req,res)=>{
    try {
        const keyword = req.query.search;
        if(!keyword){
            return res.status(400).json({
                success:false,
                message:"Search field is empty."
            })
        }

        const users = await User.find({
            $or:[
                {username : {$regex : keyword , $options : "i"}},
                {email : { $regex : keyword , $options :"i"}}
            ]
        }).select("-password");

        if(!users){
            return res.status(404).json({
                success:false,
                message:"Failed to fetch account."
            })
        }

        res.status(200).json({
            success:true,
            message:"accounts fetched successfully",
            users
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const getUserData = async(req,res)=>{
    try {
        if(!req.user){
            return res.status(404).json({
                success:false,
                message:"Token expired,Please Login again."
            })
        }

        const { id } = req.user;
        console.log(id);

        const user = await User.findById({_id : id}).select("-password");

        if(!user){
            return res.status(400).json({
                success:false,
                message:"No account found"
            })
        }

        res.status(200).json({
            success:true,
            message:"user data fetched successfully",
            user
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}