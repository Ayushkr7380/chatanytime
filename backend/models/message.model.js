import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true,
        required: true,
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    messageType: {
        type: String,
        enum: ["user", "system"],
        default: "user"
    },
    deletedFor: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }


}, {
    timestamps: true
});


export const Message = model("Message", messageSchema);