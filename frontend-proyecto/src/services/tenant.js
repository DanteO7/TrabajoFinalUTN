import { request } from "./api";
import { useAuthStore } from "../store/auth-store";

export const getTenants = () => request("get", "/tenants");

export const getTenantById = (id) => request("get", `/tenants/${id}`);

export const createTenant = (data) => {
  const { user } = useAuthStore.getState();
  console.log({
    ownerUserId: user.id,
    ...data,
  });
  return request("post", "/tenants", {
    ownerUserId: user.id,
    ...data,
  });
};

export const deleteTenant = (id) => request("delete", `/tenants/${id}`);

export const updateTenantPlan = (id, data) =>
  request("patch", `/tenants/${id}/plan`, data);

export const updateTenantActive = (id, data) =>
  request("patch", `/tenants/${id}/active`, data);

export const updateTenantStatus = (id, data) =>
  request("patch", `/tenants/${id}/status`, data);

export const getMyTenants = () => request("get", "/tenants/my-tenants");

export const getUserRolesInTenant = (tenantId) =>
  request("get", `/tenants/${tenantId}/user-roles`);
