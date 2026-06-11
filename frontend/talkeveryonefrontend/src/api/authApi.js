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

export const forgotPasswordApi = async ({ email }) => {
    const response = await axios.post(
        `${backendURL}/auth/forgot-password`,
        { email }
    );
    return response.data;
};

export const resetPasswordApi = async ({ token, newPassword }) => {
    const response = await axios.post(
        `${backendURL}/auth/reset-password`,
        { token, newPassword }
    );
    return response.data;
};