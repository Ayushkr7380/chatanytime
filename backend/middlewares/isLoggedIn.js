import { Session } from "../models/session.model.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(400).json({ success: false, message: "Token not found." });

        const data = jwt.verify(token, process.env.JWT_KEY);

        const session = await Session.findById(data.sessionId);
        if (!session) return res.status(401).json({ success: false, message: "Session expired." });

        session.lastActive = Date.now();
        await session.save();

        req.user = data;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default isLoggedIn;