import {Schema , model} from "mongoose";

const chatSchema = new Schema({
    chatName:{
        type:String,
        trim:true,
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    users:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    groupAdmin:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    latestMessage:{
        type:Schema.Types.ObjectId,
        ref:"Message"
    }

},
{timestamps:true});

export const Chat = model("Chat",chatSchema);