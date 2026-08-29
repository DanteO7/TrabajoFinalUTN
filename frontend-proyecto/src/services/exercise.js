import { request } from "./api";

export const getExercises = (tenantId) =>
  request("get", `/exercises/${tenantId}`);

export const getExercise = (id) => request("get", `/exercises/${id}`);

export const createExercise = (data) => request("post", "/exercises", data);

export const updateExercise = (id, data) =>
  request("put", `/exercises/${id}`, data);

export const deleteExercise = (id) => request("delete", `/exercises/${id}`);
