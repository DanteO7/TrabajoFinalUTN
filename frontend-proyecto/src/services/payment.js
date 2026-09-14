import { request } from "./api";

export const getMyPayments = (year, month) =>
  request("get", `/payments/my-payments?year=${year}&month=${month}`);

export const getTenantPayments = (tenantId, year, month) =>
  request("get", `/payments/tenant/${tenantId}?year=${year}&month=${month}`);

export const createPayment = (data) => request("post", "/payments", data);

export const updatePayment = (id, data) =>
  request("put", `/payments/${id}`, data);

export const deletePayment = (id) => request("delete", `/payments/${id}`);

export const getTenantPaymentsForAdmin = (year, month) =>
  request("get", `/payments/admin/tenants?year=${year}&month=${month}`);

export const getMyPaymentsByTenant = (tenantId, year, month) =>
  request(
    "get",
    `/payments/my-payments/${tenantId}?year=${year}&month=${month}`,
  );

export const getMyTenantPaymentStatus = (tenantId) =>
  request("get", `/payments/my-status/${tenantId}`);

export const createMercadoPagoStudentPayment = async (tenantId) => {
  return request("post", `/payments/mercado-pago/student/${tenantId}`);
};

export const getPayment = async (paymentId) => {
  return request("get", `/payments/${paymentId}`);
};

export const getMyBusinessPayments = async (year, month) => {
  return request(
    "get",
    `/payments/my-business-payments?year=${year}&month=${month}`,
  );
};
