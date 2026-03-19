import { request } from "./api";

export const getReservationsByTenantAndDate = (tenantId, date) =>
  request("get", `/reservations/${tenantId}/${date}`);

export const getReservationsByStudent = (studentId) =>
  request("get", `/reservations/${studentId}`);

export const createReservation = (data) =>
  request("post", "/reservations", data);

export const deleteReservation = (id) =>
  request("delete", `/reservations/${id}`);

export const updateReservation = (id, data) =>
  request("patch", `/reservations/${id}`, data);
