import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const searchUsers = async (keyword) => {
  const response = await axios.get(`${backendURL}/auth/searchUser`, {
    params: { search: keyword },
    withCredentials: true,
  });
  return response.data.users;
};