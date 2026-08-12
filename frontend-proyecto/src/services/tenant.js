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

export const updateTenant = (id, data) =>
  request("put", `/tenants/${id}`, data);

export const getMyTenants = () => request("get", "/tenants/my-tenants");

export const getUserRolesInTenant = (tenantId) =>
  request("get", `/tenants/${tenantId}/user-roles`);

export const getUserTenants = (id) => request("get", `/tenants/user/${id}`);
