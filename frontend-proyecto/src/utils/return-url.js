export function getSafeReturnUrl(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function getReturnUrlFromLocation() {
  const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
  return getSafeReturnUrl(returnUrl);
}

export function getReturnUrlPath(returnUrl, path) {
  const safeReturnUrl = getSafeReturnUrl(returnUrl);
  return safeReturnUrl
    ? `${path}?returnUrl=${encodeURIComponent(safeReturnUrl)}`
    : path;
}
