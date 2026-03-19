import { request } from "./api";

export const getUsers = () => request("get", "/users");

export const getUserById = (id) => request("get", `/users/${id}`);

export const deleteUser = (id) => request("delete", `/users/${id}`);

export const updateUser = (id, data) => request("put", `/users/${id}`, data);
