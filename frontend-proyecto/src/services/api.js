import axios from "axios";

const { VITE_API_URL } = import.meta.env;

const api = axios.create({
  baseURL: VITE_API_URL,
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

  console.log(res.data);

  return res.data;
};
