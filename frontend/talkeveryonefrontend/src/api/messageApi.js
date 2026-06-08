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

export const deleteMessageForMeApi = async (messageId) => {
    const response = await axios.delete(
        `${backendURL}/user/message/${messageId}/delete-for-me`,
        { withCredentials: true }
    );
    return response.data;
};

export const deleteMessageForEveryoneApi = async (messageId) => {
    const response = await axios.delete(
        `${backendURL}/user/message/${messageId}/delete-for-everyone`,
        { withCredentials: true }
    );
    return response.data;
};

export const editMessageApi = async ({ messageId, content }) => {
    const response = await axios.put(
        `${backendURL}/user/message/${messageId}/edit`,
        { content },
        { withCredentials: true }
    );
    return response.data;
};