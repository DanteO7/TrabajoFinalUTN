import { request } from "./api";

export const createReservation = (data) =>
  request("post", "/reservations", data);

export const getReservationById = (id) => request("get", `/reservations/${id}`);

export const getReservationsByClassId = (classId) =>
  request("get", `/reservations/class/${classId}`);

export const getReservationByClassAndStudent = (classId, studentId) =>
  request("get", `/reservations/class/${classId}/student/${studentId}`);

export const getReservationsByStudentId = (studentId) =>
  request("get", `/reservations/student/${studentId}`);

export const deleteReservation = (id) =>
  request("delete", `/reservations/${id}`);
