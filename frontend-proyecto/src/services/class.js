import { request } from "./api";

export const getClasses = (tenantId, date) =>
  request("get", `/classes/${tenantId}/${date}`);

export const hasOfficialClasses = (tenantId) =>
  request("get", `/classes/${tenantId}/exists`);

export const createClass = (data) => request("post", "/classes", data);

export const deleteClass = (id) => request("delete", `/classes/${id}`);

export const updateClass = (id, data) => request("put", `/classes/${id}`, data);

export const getStudentsByClass = (classId) =>
  request("get", `/classes/${classId}/students`);

export const deleteClasses = (classIds) =>
  request("delete", "/classes/bulk", classIds);
