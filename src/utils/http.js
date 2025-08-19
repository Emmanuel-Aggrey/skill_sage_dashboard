import axios from "axios";
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const client = axios.create({
  baseURL: REACT_APP_SERVER_URL,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
