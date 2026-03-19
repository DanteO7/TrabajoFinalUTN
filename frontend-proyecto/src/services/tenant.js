import { request } from "./api";

export const getTenants = () => request("get", "/tenants");

export const createTenant = (data) => request("post", "/tenants", data);

export const deleteTenant = (id) => request("delete", `/tenants/${id}`);

export const updateTenantPlan = (id, data) =>
  request("patch", `/tenants/${id}/plan`, data);

export const updateTenantActive = (id, data) =>
  request("patch", `/tenants/${id}/active`, data);

export const updateTenantStatus = (id, data) =>
  request("patch", `/tenants/${id}/status`, data);
