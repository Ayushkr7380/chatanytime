import { model , Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const users = new Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        minLength:[3,"Minimum length of username is 3"],
        maxLength:[15,"Maximum length of username is 15"]
    },
    name:{
        type:String,
        trim:true,
        required:true,
        minLength:[3,"Minimum length of name is 3"],
        maxLength:[15,"Maximum length of name is 15"]
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:[3,"Minimum length of password is 3"],
        maxLength:[15,"Maximum length of password is 15"]
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false,
    }
},{
    timestamps:true
});


users.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password,10);
});


users.methods = {
    generateJWTToken : async function(){
        return await jwt.sign({
            id : this._id,
            name : this.name,
            email : this.email,
            username : this.username
        },process.env.JWT_KEY,
        {
            expiresIn : process.env.JWT_EXPIRY
        })
    },

    comparePassword : async function(password){
        return await bcrypt.compare(password,this.password);
    }
}

export const User = model("User",users);