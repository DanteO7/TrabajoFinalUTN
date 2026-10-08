import { request } from "./api";

export const getClassTemplates = () => request("get", "/class-templates");

export const getClassTemplate = (id) =>
  request("get", `/class-templates/${id}`);

export const createClassTemplate = (data) =>
  request("post", "/class-templates", data);

export const updateClassTemplate = (id, data) =>
  request("put", `/class-templates/${id}`, data);

export const deleteClassTemplate = (id) =>
  request("delete", `/class-templates/${id}`);

export const addStudentToClassTemplate = (classTemplateId, studentId) =>
  request("post", `/class-templates/${classTemplateId}/students`, {
    studentId,
  });

export const removeStudentFromClassTemplate = (classTemplateId, studentId) =>
  request(
    "delete",
    `/class-templates/${classTemplateId}/students/${studentId}`,
  );

export const copyClassTemplateDay = (destinationDate, dayOfWeek) =>
  request("post", "/class-templates/copy-day", {
    dayOfWeek,
    destinationDate,
  });

export const copyClassTemplateWeek = (destinationMonday) =>
  request("post", "/class-templates/copy-week", {
    destinationMonday,
  });
