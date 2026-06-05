import { io } from "../app.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/users.model.js";


const createSystemMessage = async (chatId, content) => {

    const message = await Message.create({
        chat: chatId,
        content,
        messageType: "system",
        readBy: []
    });

    await Chat.findByIdAndUpdate(
        chatId,
        {
            latestMessage: message._id
        }
    );

    return message;
};

export const privateChat = async (req, res) => {

    try {
        const { id } = req.user;

        const othersId = req.params.id;

        if (!othersId) {
            return res.status(400).json({
                success: false,
                message: "UserId is required to start conversation."
            })
        }





        //prevent self chat

        if (id.toString() === othersId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot chat with yourself."
            })
        }

        //check other user exists in DB 

        const otherUser = await User.findById(othersId).select("name -_id");

        const { name } = otherUser;

        if (!otherUser) {
            return res.status(400).json({
                success: false,
                message: "User not found."
            })
        }

        //Check if the chat already exists

        const chat = await Chat.findOne({

            isGroupChat: false,
            users: { $all: [id, othersId] }
        }).populate("users", "-password").populate("latestMessage")



        //if chat exists then return here
        if (chat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat
            })
        }

        //create new chat
        const newChat = await Chat.create({

            isGroupChat: false,
            users: [id, othersId]
        });

        if (!newChat) {
            return res.status(400).json({
                success: false,
                message: "Failed to create new chat."
            })
        }

        const findChat = await Chat.findById(newChat._id).populate("users", "-password");

        if (!findChat) {
            return res.status(400).json({
                success: false,
                message: "Failed to load chat."
            })
        }

        res.status(200).json({
            success: true,
            message: "New chat created successfully.",
            chat: findChat
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

export const groupChat = async (req, res) => {
    try {
        const { groupName, groupMembers } = req.body;
        if (!groupName || !groupMembers) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        if (groupMembers.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Group chat needs at least 3 users"
            })
        }

        //add the logged-in user also
        groupMembers.push(req.user.id);

        const groupChat = await Chat.create({
            chatName: groupName,
            isGroupChat: true,
            users: groupMembers,
            groupAdmin: req.user.id
        });

        if (!groupChat) {
            return res.status(400).json({
                success: false,
                message: "Failed to create group."
            })
        }

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        await createSystemMessage(
            groupChat._id,
            `${req.user.name} created the group`
        );

        fullGroupChat.users.forEach((user) => {

            io.to(user._id.toString()).emit(
                "addedToGroup",
                {
                    chatId: fullGroupChat._id
                }
            );

        });

        res.status(201).json({
            success: true,
            message: "Group created successfully.",
            chat: groupChat
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const sendMessages = async (req, res) => {
    try {

        const { content, chatId } = req.body;

        if (!content || !chatId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        let chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });
        }

        // Block check only for private chat
        if (!chat.isGroupChat) {

            const receiverId = chat.users.find(
                (id) =>
                    id.toString() !==
                    req.user.id.toString()
            );

            const sender = await User.findById(
                req.user.id
            );

            const receiver = await User.findById(
                receiverId
            );

            const iBlockedHim =
                sender.blockedUsers.some(
                    (id) =>
                        id.toString() ===
                        receiverId.toString()
                );

            if (iBlockedHim) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You have blocked this user."
                });
            }

            const heBlockedMe =
                receiver.blockedUsers.some(
                    (id) =>
                        id.toString() ===
                        req.user.id.toString()
                );

            if (heBlockedMe) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot send messages to this user."
                });
            }
        }

        
        let message = await Message.create({
            sender: req.user.id,
            content,
            chat: chatId,
            readBy: [req.user.id],
        });

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Failed to send message"
            });
        }

        message = await message.populate(
            "sender",
            "username email name"
        );

        await Chat.findByIdAndUpdate(
            chatId,
            {
                latestMessage: message._id,
            }
        );

        chat = await Chat.findById(chatId).select("users");
        chat.users.forEach((user) => {
            io.to(user._id.toString()).emit("newMessageNotification", { chatId });
        });

        io.to(chatId).emit("receiveMessage", {
            _id: message._id,
            content: message.content,
            chatId,
            sender: message.sender,
            createdAt: message.createdAt,
            readBy: message.readBy,
        });

        return res.status(201).json({ success: true, message: "Message sent successfully", data: message });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
export const myAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            users: { $in: [req.user.id] }
        })
            .sort({ updatedAt: -1 })
            .populate("users", "-password")
            .populate("latestMessage");

        if (!chats) {
            return res.status(400).json({
                success: false,
                message: "Failed to fetch chats."
            });
        }

        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    readBy: { $nin: [req.user.id] }
                });

                return {
                    ...chat.toObject(),
                    unreadCount
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "All chats fetched successfully.",
            chats: chatsWithUnread,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;

        console.log(chatId);


        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: 1 })
            .populate("sender", "email username name")
            .populate({
                path: "chat",
                populate: [
                    {
                        path: "users",
                        select: "username name email"
                    },
                    {
                        path: "latestMessage",
                        populate: {
                            path: "sender",
                            select: "name"
                        }

                    }
                ]
            });



        if (!messages) {
            return res.status(400).json({
                success: false,
                message: "Failed to fetch the messages."
            })
        }

        return res.status(201).json({
            success: true,
            message: "Messages fetched successfully.",
            messages
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const markMessagesRead = async (req, res) => {
    try {
        const { chatId } = req.params;

        await Message.updateMany(
            {
                chat: chatId,
                readBy: { $nin: [req.user.id] }
            },
            {
                $push: { readBy: req.user.id }
            }
        );

        const chat = await Chat.findById(chatId).select("users");
        chat.users.forEach((user) => {
            if (user._id.toString() !== req.user.id.toString()) {
                io.to(user._id.toString()).emit("messagesRead", { chatId });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Messages marked as read."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const group = await Chat.findById(chatId);

        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found."
            });
        }


        if (group.groupAdmin.toString() === userId.toString()) {
            const remainingUsers = group.users.filter(
                (u) => u.toString() !== userId.toString()
            );

            if (remainingUsers.length === 0) {

                await Chat.findByIdAndDelete(chatId);
                return res.status(200).json({
                    success: true,
                    message: "Group deleted as no members left."
                });
            }


            const randomAdmin = remainingUsers[
                Math.floor(Math.random() * remainingUsers.length)
            ];

            group.groupAdmin = randomAdmin;
        }

        const currentUser = await User.findById(
            userId
        ).select("name");

        await createSystemMessage(
            chatId,
            `${currentUser.name} left the group`
        );


        group.users = group.users.filter(
            (u) => u.toString() !== userId.toString()
        );

        await group.save();

        io.to(chatId).emit(
            "memberLeft",
            {
                chatId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Left group successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addMember = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user.id;

        const userExists = await User.findById(userId);

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const group = await Chat.findById(chatId);

        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found."
            });
        }


        if (group.groupAdmin.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only admin can add members."
            });
        }


        const alreadyMember = group.users.some(
            (u) => u.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "User already in group."
            });
        }

        group.users.push(userId);
        await group.save();

        const addedUser = await User.findById(
            userId
        ).select("name");

        const currentUser = await User.findById(
            currentUserId
        ).select("name");

        await createSystemMessage(
            chatId,
            `${currentUser.name} added ${addedUser.name} `
        );

        const updatedGroup = await Chat.findById(chatId)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        io.to(userId).emit("addedToGroup", {
            chatId
        });

        io.to(chatId).emit(
            "memberAdded",
            {
                chatId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Member added successfully.",
            group: updatedGroup
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user.id;

        const group = await Chat.findById(chatId);

        const isMember = group.users.some(
            (u) => u.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "User is not a member."
            });
        }


        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found."
            });
        }


        if (group.groupAdmin.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only admin can remove members."
            });
        }


        if (userId.toString() === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot remove themselves. Leave group instead."
            });
        }

        const removedUser = await User.findById(
            userId
        ).select("name");

        const currentUser = await User.findById(
            currentUserId
        ).select("name");

        group.users = group.users.filter(
            (u) => u.toString() !== userId.toString()
        );

        await group.save();

        await createSystemMessage(
            chatId,
            `${removedUser.name} was removed by ${currentUser.name}`
        );

        io.to(userId).emit(
            "removedFromGroup",
            {
                chatId
            }
        );

        io.to(chatId).emit(
            "memberRemoved",
            {
                chatId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Member removed successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const makeAdmin = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user.id;

        const group = await Chat.findById(chatId);
        const isMember = group.users.some(
            (u) => u.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of this group."
            });
        }


        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found."
            });
        }


        if (group.groupAdmin.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only admin can make another admin."
            });
        }


        if (group.groupAdmin.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "User is already admin."
            });
        }

        group.groupAdmin = userId;
        await group.save();

        const newAdmin = await User.findById(
            userId
        ).select("name");

        await createSystemMessage(
            chatId,
            `${newAdmin.name} is now an admin`
        );

        io.to(chatId).emit(
            "adminChanged",
            {
                chatId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const renameGroup = async (req, res) => {
    try {

        const { chatId } = req.params;
        const { groupName } = req.body;

        const currentUserId = req.user.id;

        const group = await Chat.findById(chatId);

        if (!group || !group.isGroupChat) {
            return res.status(404).json({
                success: false,
                message: "Group not found."
            });
        }

        if (
            group.groupAdmin.toString() !==
            currentUserId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only admin can rename group."
            });
        }

        if (!groupName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Group name is required."
            });
        }

        const oldGroupName = group.chatName;

        group.chatName = groupName.trim();

        await group.save();

        const currentUser = await User.findById(
            currentUserId
        ).select("name");



        await createSystemMessage(
            chatId,
            `${currentUser.name} changed the group name from "${oldGroupName}" to "${group.chatName}"`
        );

        io.to(chatId).emit(
            "groupRenamed",
            {
                chatId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Group renamed successfully.",
            group
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};