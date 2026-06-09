import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const searchUsers = async (keyword) => {
  const response = await axios.get(`${backendURL}/auth/searchUser`, {
    params: { search: keyword },
    withCredentials: true,
  });
  return response.data.users;
};

export const getUserStatus = async (userId) => {
    const response = await axios.get(`${backendURL}/auth/status/${userId}`, {
        withCredentials: true,
    });
    return response.data;
};

export const blockUserApi = async (userId) => {
    const response = await axios.put(
        `${backendURL}/auth/block/${userId}`,
        {},
        { withCredentials: true }
    );

    return response.data;
};

export const unblockUserApi = async (userId) => {
    const response = await axios.put(
        `${backendURL}/auth/unblock/${userId}`,
        {},
        { withCredentials: true }
    );

    return response.data;
};

export const getBlockStatusApi = async (userId) => {
    const response = await axios.get(
        `${backendURL}/auth/block-status/${userId}`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

export const getUserById = async (userId) => {
    const response = await axios.get(`${backendURL}/auth/user/${userId}`, {
        withCredentials: true,
    });
    return response.data.user;
};

export const updateProfileApi = async (data) => {
    const response = await axios.put(
        `${backendURL}/auth/update-profile`,
        data,
        { withCredentials: true }
    );
    return response.data;
};

export const uploadProfilePicApi = async (file) => {
    const formData = new FormData();
    formData.append("profilePic", file);
    const response = await axios.put(
        `${backendURL}/auth/upload-profile-pic`,
        formData,
        { withCredentials: true }
    );
    return response.data;
};

export const getBlockedUsersApi = async () => {
    const response = await axios.get(
        `${backendURL}/auth/blocked-users`,
        { withCredentials: true }
    );
    return response.data;
};

export const updatePrivacyApi = async (data) => {
    const response = await axios.put(
        `${backendURL}/auth/update-privacy`,
        data,
        { withCredentials: true }
    );
    return response.data;
};