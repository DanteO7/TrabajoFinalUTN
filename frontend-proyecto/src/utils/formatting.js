import i18n from "../i18n";

export const getLocale = () =>
  (i18n.resolvedLanguage || i18n.language || "es").startsWith("en")
    ? "en-US"
    : "es-AR";

export const formatMonthYear = (value) => {
  const locale = getLocale();
  const formatted = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(value));

  return formatted.charAt(0).toLocaleUpperCase(locale) + formatted.slice(1);
};

export const formatDate = (value, options) =>
  new Intl.DateTimeFormat(getLocale(), options).format(new Date(value));

export const formatCurrency = (value, options = {}) =>
  new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "ARS",
    ...options,
  }).format(Number(value) || 0);

export const formatNumber = (value, options) =>
  new Intl.NumberFormat(getLocale(), options).format(Number(value) || 0);
