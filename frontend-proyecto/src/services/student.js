import { request } from "./api";

export const assignStudent = (data) =>
  request("post", "/students/assign", data);

export const getStudents = (params) =>
  request("get", "/students", null, params);

export const getStudentById = (id) => request("get", `/students/${id}`);

export const deleteStudent = (id) => request("delete", `/students/${id}`);

export const updateStudent = (id, data) =>
  request("put", `/students/${id}`, data);

export const getStudentByUser = (tenantId) =>
  request("get", `/students/me/${tenantId}`);
