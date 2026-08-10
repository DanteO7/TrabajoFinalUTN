import { request } from "./api";

export const createWaitlist = (data) => request("post", "/waitlists", data);

export const getWaitlistByStudentId = (studentId) =>
  request("get", `/waitlists/student/${studentId}`);

export const deleteWaitlist = (id) => request("delete", `/waitlists/${id}`);
