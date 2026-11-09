import i18n from "../i18n";

export const validationError = (key) => () => i18n.t(`validation.${key}`);

export const validationMessage = (key) => ({
  error: validationError(key),
});
