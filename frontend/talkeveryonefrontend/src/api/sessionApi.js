import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getSessionsApi = async () => {
    const response = await axios.get(
        `${backendURL}/auth/sessions`,
        { withCredentials: true }
    );
    return response.data;
};

export const logoutSessionApi = async (sessionId) => {
    const response = await axios.delete(
        `${backendURL}/auth/sessions/${sessionId}`,
        { withCredentials: true }
    );
    return response.data;
};

export const logoutAllApi = async () => {
    const response = await axios.delete(
        `${backendURL}/auth/sessions/all`,
        { withCredentials: true }
    );
    return response.data;
};