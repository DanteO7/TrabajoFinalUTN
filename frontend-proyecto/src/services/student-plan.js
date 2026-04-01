import { request } from "./api";

export const getStudentPlans = (tenantId) =>
  request("get", `/studentsPlan/${tenantId}`);

export const createStudentPlan = (data) =>
  request("post", "/studentsPlan", data);

export const deleteStudentPlan = (id) =>
  request("delete", `/studentsPlan/${id}`);

export const updateStudentPlan = (id, data) =>
  request("put", `/studentsPlan/${id}`, data);
