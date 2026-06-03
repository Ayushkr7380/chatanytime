import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getAllChats = async () => {
  const response = await axios.get(`${backendURL}/user/all-chats`, {
    withCredentials: true,
  });
  return response.data.chats;
};

export const createChatApi = async (otherUserId) => {
  const response = await axios.post(
    `${backendURL}/user/chat/${otherUserId}`,
    {},
    { withCredentials: true }
  );

  return response.data;
};