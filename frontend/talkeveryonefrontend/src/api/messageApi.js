import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const getMessages = async (chatId) => {
  const response = await axios.get(`${backendURL}/user/message/${chatId}`, {
    withCredentials: true,
  });
  return response.data.messages;
};

export const sendMessageApi = async ({
  content,
  chatId,
  receiverId,
  files,
  replyTo
}) => {
  const formData = new FormData();

  if (content) formData.append("content", content);
  if (chatId) formData.append("chatId", chatId);
  if (receiverId) formData.append("receiverId", receiverId);

  if (replyTo) {
    formData.append("replyTo", replyTo);
  }

  if (files?.length) {
    files.forEach(file => formData.append("files", file));
  }

  const response = await axios.post(
    `${backendURL}/user/message`,
    formData,
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