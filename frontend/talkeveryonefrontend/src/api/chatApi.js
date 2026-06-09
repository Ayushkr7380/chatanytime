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

export const markMessagesRead = async (chatId) => {
    const response = await axios.put(
        `${backendURL}/user/message/read/${chatId}`,
        {},
        { withCredentials: true }
    );
    return response.data;
};


export const createGroupChat = async ({ groupName, groupMembers }) => {
    const response = await axios.post(
        `${backendURL}/user/groupchat`,
        { groupName, groupMembers },
        { withCredentials: true }
    );
    return response.data;
};

export const addMemberApi = async ({ chatId, userId }) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/add-member`,
        { userId },
        { withCredentials: true }
    );

    return response.data;
};

export const removeMemberApi = async ({ chatId, userId }) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/remove-member`,
        { userId },
        { withCredentials: true }
    );

    return response.data;
};

export const makeAdminApi = async ({ chatId, userId }) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/make-admin`,
        { userId },
        { withCredentials: true }
    );

    return response.data;
};

export const leaveGroupApi = async (chatId) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/leave`,
        {},
        { withCredentials: true }
    );

    return response.data;
};

export const renameGroupApi = async ({ chatId, groupName }) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/rename`,
        { groupName },
        { withCredentials: true }
    );

    return response.data;
};

export const deleteChatApi = async (chatId) => {
    const response = await axios.delete(
        `${backendURL}/user/chat/${chatId}/delete`,
        { withCredentials: true }
    );
    return response.data;
};

export const clearChatApi = async (chatId) => {
    const response = await axios.put(
        `${backendURL}/user/chat/${chatId}/clear`,
        {},
        { withCredentials: true }
    );
    return response.data;
};

export const updateGroupBioApi = async ({ chatId, groupBio }) => {
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/bio`,
        { groupBio },
        { withCredentials: true }
    );
    return response.data;
};

export const uploadGroupPicApi = async ({ chatId, file }) => {
    const formData = new FormData();
    formData.append("groupPic", file);
    const response = await axios.put(
        `${backendURL}/user/group/${chatId}/pic`,
        formData,
        { withCredentials: true }
    );
    return response.data;
};