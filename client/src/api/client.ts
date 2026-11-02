
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL || "collage-erp-two.vercel.app/api",
  withCredentials: true,
});

export default api;


