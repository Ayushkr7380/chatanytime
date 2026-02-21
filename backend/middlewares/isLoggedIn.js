import jwt from "jsonwebtoken";


const isLoggedIn = async(req,res,next)=>{

    try {
        const {token} = req.cookies;
       
        if(!token){
            return res.status(400).json({
                success:false,
                message:"Token not found."
            })
        }

        const data = jwt.verify(token,process.env.JWT_KEY);
        
        req.user = data;
        // console.log(req.user);
        

        next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }


}

export default isLoggedIn;