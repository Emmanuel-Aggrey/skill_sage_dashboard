import axios from "axios";

const SERVER_URL =
  process.env.REACT_APP_SERVER_URL ||
  "https://skill-sage-backend-njh6.onrender.com";

export const client = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
