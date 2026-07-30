import { request } from "./api";

export const createInvitation = (data) => request("post", `/invitations`, data);

export const getInvitationInfo = (token) =>
  request("get", `/invitations/${token}`);

export const acceptInvitation = (token, data) =>
  request("post", `/invitations/accept/${token}`, data);

export const deleteInvitation = (id) => request("delete", `/invitations/${id}`);

export const getInvitationByTenant = (tenantId, role) =>
  request("get", `/invitations/tenant/${tenantId}/${role}`);
