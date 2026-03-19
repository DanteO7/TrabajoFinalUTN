import { request } from "./api";

export const assignProfessor = (data) =>
  request("post", "/professors/assign", data);

export const getProfessors = () => request("get", "/professors");

export const getProfessorById = (id) => request("get", `/professors/${id}`);

export const deleteProfessor = (id) => request("delete", `/professors/${id}`);

export const updateProfessor = (id, data) =>
  request("patch", `/professors/${id}`, data);

export const addSpeciality = (professorId, specialityId) =>
  request("post", `/professors/${professorId}/especialities/${specialityId}`);

export const removeSpeciality = (professorId, specialityId) =>
  request("delete", `/professors/${professorId}/especialities/${specialityId}`);
