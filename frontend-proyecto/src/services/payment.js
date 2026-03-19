// api/paymentService.js
import { request } from "./api";

export const getPaymentsByUser = (userId) =>
  request("get", `/payments/${userId}`);

export const createPayment = (data) => request("post", "/payments", data);

export const deletePayment = (id) => request("delete", `/payments/${id}`);

export const updatePayment = (id, data) =>
  request("put", `/payments/${id}`, data);
