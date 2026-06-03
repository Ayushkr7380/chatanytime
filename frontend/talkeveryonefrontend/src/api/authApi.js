import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;


export const getMeApi = async () => {
  const response = await axios.get(
    `${backendURL}/auth/me`,
    { withCredentials: true }
  );

  return response.data;
};

export const loginApi = async (data) => {
  const response = await axios.post(
    `${backendURL}/auth/loginUser`,
    data,
    { withCredentials: true }
  );

  return response.data;
};

export const registerApi = async (data) => {
  const response = await axios.post(
    `${backendURL}/auth/registerUser`,
    data,
    { withCredentials: true }
  );

  return response.data;
};

export const logoutApi = async () => {
    const response = await axios.post(
        `${backendURL}/auth/logoutUser`,
        {},
        {
            withCredentials: true,
        }
    );

    return response.data;
};