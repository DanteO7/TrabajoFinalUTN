import { request } from "./api";

export const assignProfessor = (data) =>
  request("post", "/professors/assign", data);

export const getProfessors = (tenantId) =>
  request("get", "/professors", null, { tenantId });

export const getProfessorById = (id) => request("get", `/professors/${id}`);

export const deleteProfessor = (id) => request("delete", `/professors/${id}`);

export const updateProfessor = (id, data) =>
  request("put", `/professors/${id}`, data);
