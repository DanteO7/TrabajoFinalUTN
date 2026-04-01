import { request } from "./api";

export const getTenantPlans = () => request("get", "/tenantsPlan");

export const createTenantPlan = (data) => request("post", "/tenantsPlan", data);

export const deleteTenantPlan = (id) => request("delete", `/tenantsPlan/${id}`);

export const updateTenantPlan = (id, data) =>
  request("put", `/tenantsPlan/${id}`, data);
