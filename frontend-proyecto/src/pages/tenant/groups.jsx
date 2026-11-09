import React from "react";
import { useTranslation } from "react-i18next";

export default function Groups({ tenantId }) {
  const { t } = useTranslation();
  return <div>{t("tenantPages.groups.title")}{tenantId}</div>;
}
