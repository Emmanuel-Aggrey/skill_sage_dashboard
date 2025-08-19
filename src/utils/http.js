import axios from "axios";

const SERVER_URL = "https://skill-sage-backend-njh6.onrender.com";

const REACT_APP_SERVER_URL = SERVER_URL;
const REACT_APP_LOCAL_BASE_URL = SERVER_URL;
const REACT_APP_SERVER_BASE_URL = SERVER_URL;

export const client = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
