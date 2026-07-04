import { request } from "./api";

export const signUp = (data) => request("post", "/auth/register", data);

export const signIn = (data) => request("post", "/auth/login", data);

export const signOut = () => request("post", "/auth/logout");

export const checkAuth = async () => {
  try {
    await request("get", "/auth/health");
    return true;
  } catch {
    return false;
  }
};

export const me = () => request("get", "/auth/me");

export const sendRegisterCode = (data) =>
  request("post", "/auth/send-register-code", data);

export const forgotPassword = (data) =>
  request("post", "/auth/forgot-password", data);
