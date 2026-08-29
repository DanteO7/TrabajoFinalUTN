import axios from "axios";

const getTenantIdFromUrl = () => {
  const match = window.location.pathname.match(/^\/tu-espacio\/(\d+)/);

  return match ? Number(match[1]) : null;
};

const API_URL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const tenantId = getTenantIdFromUrl();

  if (tenantId !== null) {
    config.headers["X-Tenant-Id"] = tenantId;
  }

  return config;
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
