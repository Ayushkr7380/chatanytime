import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getMessages = async (chatId) => {
  const response = await axios.get(`${backendURL}/user/message/${chatId}`, {
    withCredentials: true,
  });
  return response.data.messages;
};

export const sendMessageApi = async ({ content, chatId ,receiverId }) => {
  const response = await axios.post(
    `${backendURL}/user/message`,
    { content, chatId ,receiverId  },
    { withCredentials: true }
  );
  return response.data;
};