import { model, Schema } from "mongoose";

const sessionSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    deviceInfo: {
        browser: String,
        os: String,
        device: String,
    },
    ipAddress: String,
    location: {
         type: String, 
        default: "Unknown"
     },
    lastActive: { 
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

export const Session = model("Session", sessionSchema);