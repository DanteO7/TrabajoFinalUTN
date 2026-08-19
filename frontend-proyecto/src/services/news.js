import { request } from "./api";

export const createNews = (data) => request("post", "/news", data);

export const updateNews = (id, data) => request("put", `/news/${id}`, data);

export const getNews = (tenantId) =>
  request("get", "/news", null, { tenantId });

export const getUnreadNewsCount = (tenantId) =>
  request(
    "get",
    "/news/unread-count",
    null,
    tenantId != null ? { tenantId } : {},
  );

export const markNewsAsRead = (id) =>
  request("post", `/news/${id}/mark-as-read`);

export const deleteNews = (id, tenantId) =>
  request("delete", `/news/${id}`, null, { tenantId });
