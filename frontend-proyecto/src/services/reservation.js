import { request } from "./api";

export const createReservation = (data) =>
  request("post", "/reservations/bulk", data);

export const getReservationById = (id) => request("get", `/reservations/${id}`);

export const getReservationsByClassId = (classId) =>
  request("get", `/reservations/class/${classId}`);

export const getReservationByClassAndStudent = (classId, studentId) =>
  request("get", `/reservations/class/${classId}/student/${studentId}`);

export const getReservationsByStudentId = (
  studentId,
  month,
  year,
  includeAllStatuses = false,
) => {
  const query = new URLSearchParams();

  if (month !== undefined && year !== undefined) {
    query.set("month", month);
    query.set("year", year);
    if (includeAllStatuses) {
      query.set("includeAllStatuses", "true");
    }
  }

  const queryString = query.toString();
  return request(
    "get",
    `/reservations/student/${studentId}${queryString ? `?${queryString}` : ""}`,
  );
};

export const deleteReservation = (id) =>
  request("delete", `/reservations/${id}`);
