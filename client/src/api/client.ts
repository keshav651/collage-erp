
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL || "https://collage-erp-hnx0.onrender.com/api",
  withCredentials: true,
});

export default api;


