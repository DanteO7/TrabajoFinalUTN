import { request } from "./api";

export const getActivities = (tenantId) =>
  request("get", `/activities/${tenantId}`);

export const createActivity = (data) => request("post", "/activities", data);

export const deleteActivity = (id) => request("delete", `/activities/${id}`);

export const updateActivity = (id, data) =>
  request("put", `/activities/${id}`, data);
