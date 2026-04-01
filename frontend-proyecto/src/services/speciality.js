import { request } from "./api";

export const getSpecialities = (tenantId) =>
  request("get", `/specialities/${tenantId}`);

export const createSpeciality = (data) =>
  request("post", "/specialities", data);

export const deleteSpeciality = (id) =>
  request("delete", `/specialities/${id}`);

export const updateSpeciality = (id, data) =>
  request("put", `/specialities/${id}`, data);
