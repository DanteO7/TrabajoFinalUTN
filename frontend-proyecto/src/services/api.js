import axios from "axios";

const API_URL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
  },
});

export const request = async (method, url, data = null, params = null) => {
  const res = await api({
    method,
    url,
    data,
    params,
  });

  return res.data;
};
