import { request } from "./api";

export const getRoutines = (tenantId) =>
  request("get", `/routines/${tenantId}`);

export const getRoutine = (id) => request("get", `/routines/${id}`);

export const createRoutine = (data) => request("post", "/routines", data);

export const updateRoutine = (id, data) =>
  request("put", `/routines/${id}`, data);

export const deleteRoutine = (id) => request("delete", `/routines/${id}`);
