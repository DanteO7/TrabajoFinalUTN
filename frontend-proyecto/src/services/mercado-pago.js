import { request } from "./api";

export const getMercadoPagoStatus = (tenantId) =>
  request("get", `/mercadopago/status/${tenantId}`);

export const connectMercadoPago = async (tenantId) => {
  const response = await request("get", `/mercadopago/connect/${tenantId}`);

  window.location.href = response.url;
};

export const disconnectMercadoPago = async (tenantId) => {
  await request("delete", `/mercadopago/disconnect/${tenantId}`);
};
