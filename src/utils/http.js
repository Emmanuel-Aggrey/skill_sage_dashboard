import axios from "axios";
import { LOCAL_BASE_URL, SERVER_BASE_URL, SERVER_URL } from "./constants";

export const client = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    'Authorization':`Bearer ${localStorage.getItem('token')}`
  },
});