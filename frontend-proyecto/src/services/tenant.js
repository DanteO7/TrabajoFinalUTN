import { request } from "./api";
import { useAuthStore } from "../store/auth-store";

export const getTenants = () => request("get", "/tenants");

export const getTenantById = (id) => request("get", `/tenants/${id}`);

export const createTenant = (data) => {
  const { user } = useAuthStore.getState();
  return request("post", "/tenants", {
    ownerUserId: user.id,
    ...data,
  });
};

export const deleteTenant = (id) => request("delete", `/tenants/${id}`);

export const updateTenant = (id, data) =>
  request("put", `/tenants/${id}`, data);

export const getMyTenants = (onlyOwned = false) => {
  return request("get", `/tenants/my-tenants?onlyOwned=${onlyOwned}`);
};

export const getMyPermissionInTenant = (tenantId) =>
  request("get", `/tenants/${tenantId}/my-permissions`);

export const getUserTenants = (id) => request("get", `/tenants/user/${id}`);

export const getPendingPaymentTenants = () =>
  request("get", `/tenants/pending-payment`);

export const requestTenant = (formData) =>
  request("post", "/tenants/request", formData);

export const getTenantDataFromToken = (token) =>
  request("get", "/tenants/create-from-token", null, { token });

export const createTenantFromToken = (token, data) =>
  request("post", "/tenants/create-from-token", {
    token,
    name: data.name,
    tenantPlanId: data.tenantPlanId,
  });

export const sendTenantCreatedEmail = (tenantId) =>
  request("post", `/tenants/${tenantId}/send-email-creation`);
