import { User } from "../models/users.model.js";
import { io } from "../app.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs/promises';
import { UAParser } from "ua-parser-js";
import { Session } from "../models/session.model.js";
import jwt from "jsonwebtoken";
import { getLocation } from "../utils/getLocation.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 5 * 24 * 60 * 60 * 1000
}

export const registerUser = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        if (!username || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "The username already exists."
            })
        }

        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "The email already exists."
            })
        }

        user = await User.create({ username, name, email, password });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Failed to create user"
            })
        }

        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
        const location = await getLocation(ip);

        const session = await Session.create({
            userId: user._id,
            deviceInfo: {
                browser: ua.browser.name,
                os: ua.os.name,
                device: ua.device.type || "desktop",
            },
            ipAddress: ip,
            location
        });

        const token = await user.generateJWTToken(session._id);
        res.cookie("token", token, cookieOptions);


        user.password = undefined;

        res.status(200).json({
            sucess: true,
            message: "user created successfully",
            user,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        const user = await User.findOne({ email }).select(+"password");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({
                success: false,
                message: "Email or password is incorrect."
            })
        }

        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
        const location = await getLocation(ip);

        const session = await Session.create({
            userId: user._id,
            deviceInfo: {
                browser: ua.browser.name,
                os: ua.os.name,
                device: ua.device.type || "desktop",
            },
            ipAddress: ip,
            location
        });


        const token = await user.generateJWTToken(session._id);
        res.cookie("token", token, cookieOptions);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User logged In successfully.",
            user,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

export const getActiveSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.user.id }).sort({ lastActive: -1 });
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutAll = async (req, res) => {
    try {
        await Session.deleteMany({ userId: req.user.id });
        res.cookie("token", "", { httpOnly: true, sameSite: "None", expires: new Date(0), secure: true });
        res.status(200).json({ success: true, message: "Logged out from all devices." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutParticularDevice = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, message: "Session not found." });

        await Session.findByIdAndDelete(sessionId);

        const isCurrentDevice = sessionId === req.user.sessionId.toString();

        if (isCurrentDevice) {
            res.cookie("token", "", { httpOnly: true, sameSite: "None", expires: new Date(0), secure: true });
        }

        res.status(200).json({
            success: true,
            message: "Device logged out.",
            currentDevice: isCurrentDevice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.user.sessionId);

        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "None",
            expires: new Date(0),
            secure: true
        });

        res.status(200).json({
            success: true,
            message: "Logout Successfully."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const searchUser = async (req, res) => {
    try {
        const keyword = req.query.search;
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Search field is empty."
            })
        }

        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } }
            ]
        }).select("-password");

        if (!users) {
            return res.status(404).json({
                success: false,
                message: "Failed to fetch account."
            })
        }

        res.status(200).json({
            success: true,
            message: "accounts fetched successfully",
            users
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getUserData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "Token expired,Please Login again."
            })
        }

        const { id } = req.user;
        console.log(id);

        const user = await User.findById({ _id: id }).select("-password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found"
            })
        }

        res.status(200).json({
            success: true,
            message: "user data fetched successfully",
            user,
            sessionId: req.user.sessionId
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const currentUser = await User.findById(
            req.user.id
        ).select("blockedUsers");

        const targetUser = await User.findById(
            userId
        ).select(
            "isOnline lastSeen blockedUsers privacy bio profilePic"
        );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const iBlockedHim =
            currentUser.blockedUsers.some(
                id => id.toString() === userId.toString()
            );

        const heBlockedMe =
            targetUser.blockedUsers.some(
                id => id.toString() === req.user.id.toString()
            );

        if (iBlockedHim || heBlockedMe) {
            return res.status(200).json({
                success: true,
                hidden: true,
                isOnline: false,
                lastSeen: null,
                bio: null,
                profilePic: null,
            });
        }

        return res.status(200).json({
            success: true,
            hidden: false,

            isOnline: targetUser.privacy?.onlineStatus
                ? targetUser.isOnline
                : false,

            lastSeen: targetUser.privacy?.lastSeen
                ? targetUser.lastSeen
                : null,

            bio: targetUser.privacy?.bio
                ? targetUser.bio
                : null,

            profilePic: targetUser.privacy?.profilePic
                ? targetUser.profilePic
                : null,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const blockUser = async (req, res) => {
    try {

        const currentUserId = req.user.id;
        const { userId } = req.params;

        if (currentUserId === userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot block yourself."
            });
        }

        const currentUser = await User.findById(currentUserId);

        const alreadyBlocked =
            currentUser.blockedUsers.some(
                (id) => id.toString() === userId
            );

        if (alreadyBlocked) {
            return res.status(400).json({
                success: false,
                message: "User already blocked."
            });
        }

        await User.findByIdAndUpdate(
            currentUserId,
            {
                $addToSet: {
                    blockedUsers: userId
                }
            }
        );

        io.to(userId).emit(
            "userBlocked",
            {
                blockedBy: currentUserId
            }
        );

        return res.status(200).json({
            success: true,
            message: "User blocked successfully."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const unblockUser = async (req, res) => {
    try {

        const currentUserId = req.user.id;
        const { userId } = req.params;

        await User.findByIdAndUpdate(
            currentUserId,
            {
                $pull: {
                    blockedUsers: userId
                }
            }
        );

        io.to(userId).emit(
            "userUnblocked",
            {
                unblockedBy: currentUserId
            }
        );

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getBlockStatus = async (req, res) => {
    try {

        const currentUserId = req.user.id;
        const { userId } = req.params;

        const currentUser = await User.findById(
            currentUserId
        );

        const otherUser = await User.findById(
            userId
        );

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isBlockedByMe =
            currentUser.blockedUsers.some(
                (id) =>
                    id.toString() ===
                    userId.toString()
            );

        const blockedMe =
            otherUser.blockedUsers.some(
                (id) =>
                    id.toString() ===
                    currentUserId.toString()
            );

        return res.status(200).json({
            success: true,
            isBlockedByMe,
            blockedMe,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select("name username email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio, profilePic } = req.body;
        const userId = req.user.id;

        if (username) {
            const existing = await User.findOne({
                username,
                _id: { $ne: userId }
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken."
                });
            }
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            {
                ...(name && { name, nameUpdatedAt: new Date() }),
                ...(username && { username, usernameUpdatedAt: new Date() }),
                ...(bio !== undefined && { bio, bioUpdatedAt: new Date() }),
                ...(profilePic === null && { profilePic: "" }),
            },
            { new: true }
        ).select("-password");



        return res.status(200).json({
            success: true,
            message: "Profile updated.",
            user: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getBlockedUsers = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("blockedUsers", "name username profilePic");

        return res.status(200).json({
            success: true,
            blockedUsers: user.blockedUsers
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded."
            });
        }

        const filePath = `uploads/${req.file.filename}`;

        // cloudinary upload
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "chatanytime/profiles",
            public_id: `user_${req.user.id}`,
            overwrite: true,
            transformation: [{ width: 400, height: 400, crop: "fill" }]
        });

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: result.secure_url },
            { new: true }
        ).select("-password");

        try {
            await fs.rm(filePath, { force: true });

        } catch (err) {
            console.warn('File not found or could not be deleted:', err.message);
        }


        return res.status(200).json({
            success: true,
            message: "Profile pic updated.",
            user: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePrivacy = async (req, res) => {
    try {
        const {
            lastSeen,
            profilePic,
            bio,
            onlineStatus
        } = req.body;

        const updateData = {};

        if (lastSeen !== undefined) {
            updateData["privacy.lastSeen"] = lastSeen;
        }

        if (profilePic !== undefined) {
            updateData["privacy.profilePic"] = profilePic;
        }

        if (bio !== undefined) {
            updateData["privacy.bio"] = bio;
        }

        if (onlineStatus !== undefined) {
            updateData["privacy.onlineStatus"] = onlineStatus;
        }

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");
        io.emit("userPrivacyUpdated", {
            userId: req.user.id,
            privacy: updated.privacy,
            isOnline: updated.isOnline,
            lastSeen: updated.lastSeen,
            bio: updated.bio,
            profilePic: updated.profilePic
        });

        return res.status(200).json({
            success: true,
            message: "Privacy updated successfully.",
            user: updated,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "No account found with this email." });

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_KEY,
            { expiresIn: "15m" }
        );

        user.resetPasswordToken = resetToken;
        await user.save({ validateBeforeSave: false });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(user.email, user.name, resetLink);
        

        res.status(200).json({ success: true, message: "Reset link sent to your email." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired reset link." });

        user.password = newPassword;
        user.resetPasswordToken = null;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, message: "Password reset successfully." });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ success: false, message: "Reset link has expired." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};