import { request } from "./api";

export const getTenantOnboarding = () => request("get", "/tenants/onboarding");

export const updateOnboardingCurrentStep = (currentStep) =>
  request("put", "/tenants/onboarding/current-step", {
    currentStep,
  });

export const completeOnboardingStep = (step) =>
  request("put", "/tenants/onboarding/complete-step", {
    step,
  });
