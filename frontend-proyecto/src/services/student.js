import { request } from "./api";

export const assignStudent = (data) =>
  request("post", "/students/assign", data);

export const getStudents = () => request("get", "/students");

export const getStudentById = (id) => request("get", `/students/${id}`);

export const deleteStudent = (id) => request("delete", `/students/${id}`);

export const updateStudentPlan = (id, data) =>
  request("patch", `/students/${id}/plan`, data);

export const updateStudentStatus = (id, data) =>
  request("patch", `/students/${id}/status`, data);
