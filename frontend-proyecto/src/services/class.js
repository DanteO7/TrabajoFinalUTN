import { request } from "./api";

export const getClasses = (tenantId, date) =>
  request("get", `/classes/${tenantId}/${date}`);

export const createClass = (data) => request("post", "/classes", data);

export const deleteClass = (id) => request("delete", `/classes/${id}`);

export const updateClass = (id, data) => request("put", `/classes/${id}`, data);

export const getStudentsByClass = (classId) =>
  request("get", `/classes/${classId}/students`);
