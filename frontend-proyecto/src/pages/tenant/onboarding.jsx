import { useRef, useState } from "react";
import { Redirect, useLocation } from "wouter";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTenantOnboarding,
  updateOnboardingCurrentStep,
  completeOnboardingStep,
} from "../../services/tenant-onboarding";

import Loading from "../../components/loading";
import MainLayout from "../../layouts/main-layout";
import WhiteButton from "../../components/buttons/white-button";
import BlackButton from "../../components/buttons/black-button";
import RedButton from "../../components/buttons/red-button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import ActivitiesStep from "../../components/onboarding/activities-step";
import ClassesStep from "../../components/onboarding/classes-step";
import InviteProfessorStep from "../../components/onboarding/invite-professor-step";
import InviteStudentStep from "../../components/onboarding/invite-student-step";
import SpecialitiesStep from "../../components/onboarding/specialities-step";
import StudentPlansStep from "../../components/onboarding/student-plans-step";
import PaymentDemoStep from "../../components/onboarding/payment-demo-step";
import WelcomeNewsStep from "../../components/onboarding/welcome-news-step";
import {
  getWelcomeNewsGreeting,
  getWelcomeNewsTitle,
} from "../../components/onboarding/welcome-news-content";
import { getActivities } from "../../services/activity";
import { hasOfficialClasses } from "../../services/class";
import { getInvitationByTenant } from "../../services/invitation";
import { getProfessors } from "../../services/professor";
import { getSpecialities } from "../../services/speciality";
import { getStudentPlans } from "../../services/student-plan";
import { getNews } from "../../services/news";
import { getTenantById } from "../../services/tenant";

const steps = [
  { id: "welcome", title: "Bienvenido a TurnoFácil" },
  { id: "activities", title: "Creá tus actividades" },
  { id: "firstClass", title: "Creá tu primera clase" },
  { id: "inviteProfessor", title: "Invitá a un profesor" },
  { id: "specialities", title: "Creá una profesión" },
  { id: "studentPlans", title: "Creá un plan para alumnos" },
  { id: "inviteStudent", title: "Invitá a un alumno" },
  { id: "firstPayment", title: "Registrá un pago" },
  { id: "welcomeNews", title: "Publicá una bienvenida" },
  { id: "finish", title: "¡Todo listo!" },
];

export default function TenantOnboarding({ tenantId }) {
  const isSmallScreen = useMediaQuery("(min-width: 500px)");
  const [paymentDemoCompletedTenantId, setPaymentDemoCompletedTenantId] =
    useState(null);
  const [welcomeNewsCreatedTenantId, setWelcomeNewsCreatedTenantId] =
    useState(null);
  const [navigationError, setNavigationError] = useState("");
  const navigationRequestInProgress = useRef(false);

  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const {
    data: onboarding,
    isLoading,
    isError,
    isSuccess: isOnboardingSuccess,
    isFetchedAfterMount: hasVerifiedOnboarding,
    error: onboardingError,
  } = useQuery({
    queryKey: ["tenant-onboarding", tenantId],
    queryFn: getTenantOnboarding,
    enabled: !!tenantId,
    retry: false,
  });

  const [
    activitiesQuery,
    officialClassesQuery,
    professorInvitationQuery,
    studentInvitationQuery,
    professorsQuery,
    specialitiesQuery,
    studentPlansQuery,
    tenantQuery,
    welcomeNewsQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: ["getActivities", tenantId],
        queryFn: () => getActivities(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["getClasses", tenantId, "exists"],
        queryFn: () => hasOfficialClasses(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["invitation", tenantId, "Professor"],
        queryFn: () => getInvitationByTenant(tenantId, "Professor"),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
        retry: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["invitation", tenantId, "Student"],
        queryFn: () => getInvitationByTenant(tenantId, "Student"),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
        retry: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["getProfessors", tenantId],
        queryFn: () => getProfessors(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["getSpecialities", tenantId],
        queryFn: () => getSpecialities(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["getStudentPlans", tenantId],
        queryFn: () => getStudentPlans(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["tenantById", tenantId],
        queryFn: () => getTenantById(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
      {
        queryKey: ["news", tenantId],
        queryFn: () => getNews(tenantId),
        enabled: !!tenantId && isOnboardingSuccess && hasVerifiedOnboarding,
      },
    ],
  });
  const isCheckingStepCompletion = [
    activitiesQuery,
    officialClassesQuery,
    professorInvitationQuery,
    studentInvitationQuery,
    professorsQuery,
    specialitiesQuery,
    studentPlansQuery,
    tenantQuery,
    welcomeNewsQuery,
  ].some((query) => query.isLoading);

  const updateStepMutation = useMutation({
    mutationFn: updateOnboardingCurrentStep,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tenant-onboarding", tenantId],
      });
    },
  });

  const completeStepMutation = useMutation({
    mutationFn: completeOnboardingStep,
    onSuccess: async (_data, completedStep) => {
      await queryClient.invalidateQueries({
        queryKey: ["tenant-onboarding", tenantId],
      });

      if (completedStep === "finish") {
        queryClient.setQueryData(["tenantById", tenantId], (tenant) =>
          tenant ? { ...tenant, onboardingCompleted: true } : tenant,
        );
      }
    },
  });

  if (isError && onboardingError?.response?.status === 404) {
    return <Redirect to="/not-found" />;
  }

  if (isLoading || isCheckingStepCompletion) return <Loading />;

  if (isError || !onboarding) {
    return (
      <div className="p-6 flex flex-col items-center text-center gap-4 mt-8">
        <p>No se pudo cargar la configuración inicial del negocio.</p>
        <RedButton
          type="button"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["tenant-onboarding", tenantId],
            })
          }
          text="Reintentar"
          wfit
          textSmall
        />
      </div>
    );
  }

  if (onboarding.completed) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center mt-8">
        <h1 className="text-3xl font-bold">¡Tu negocio está configurado!</h1>
        <p className="my-3">
          Ya completaste la configuración inicial de TurnoFácil.
        </p>

        <RedButton
          text="Ir a mi negocio"
          type="button"
          onClick={() => navigate(`/tu-espacio/${tenantId}`)}
          textSmall
        />
      </div>
    );
  }

  const currentStep = onboarding.currentStep;
  const step = steps[currentStep - 1];

  const handleNext = async () => {
    if (navigationRequestInProgress.current) return;

    navigationRequestInProgress.current = true;
    setNavigationError("");

    try {
      await completeStepMutation.mutateAsync(step.id);

      if (step.id === "finish") {
        navigate(`/tu-espacio/${tenantId}`);
        return;
      }

      const nextStep = Math.min(currentStep + 1, steps.length);

      await updateStepMutation.mutateAsync(nextStep);
    } catch (error) {
      console.error("Error al avanzar el onboarding:", error);
      const responseError = error?.response?.data;
      const validationErrors = responseError?.errors
        ? Object.values(responseError.errors).flat().join(" - ")
        : null;
      setNavigationError(
        (typeof responseError === "string" ? responseError : null) ||
          responseError?.message ||
          responseError?.title ||
          validationErrors ||
          "No se pudo guardar el progreso. Intentá nuevamente.",
      );
    } finally {
      navigationRequestInProgress.current = false;
    }
  };

  const handlePrevious = async () => {
    try {
      const previousStep = Math.max(currentStep - 1, 1);

      await updateStepMutation.mutateAsync(previousStep);
    } catch (error) {
      console.error("Error al retroceder el onboarding:", error);
    }
  };

  const handleLater = () => {
    navigate(`/tu-espacio/${tenantId}`);
  };

  if (!step) return null;

  const hasValidProfessorInvitation =
    professorInvitationQuery.data?.expirationDate &&
    new Date(professorInvitationQuery.data.expirationDate) > new Date();
  const hasValidStudentInvitation =
    studentInvitationQuery.data?.expirationDate &&
    new Date(studentInvitationQuery.data.expirationDate) > new Date();
  const hasAssignedProfession =
    professorsQuery.data?.some((professor) =>
      professor.specialities?.some((assignedProfession) =>
        specialitiesQuery.data?.some(
          (speciality) => speciality.id === assignedProfession.specialityId,
        ),
      ),
    ) ?? false;
  const hasWelcomeNews =
    tenantQuery.data?.name &&
    welcomeNewsQuery.data?.some(
      (item) =>
        String(item.tenantId) === String(tenantId) &&
        (item.title === getWelcomeNewsTitle(tenantQuery.data.name) ||
          item.content?.startsWith(
            getWelcomeNewsGreeting(tenantQuery.data.name),
          )),
    );

  const actualCompletion = {
    activities: activitiesQuery.isSuccess && activitiesQuery.data.length > 0,
    firstClass:
      officialClassesQuery.isSuccess && officialClassesQuery.data === true,
    specialities:
      professorsQuery.isSuccess &&
      specialitiesQuery.isSuccess &&
      hasAssignedProfession,
    studentPlans:
      studentPlansQuery.isSuccess && studentPlansQuery.data.length > 0,
    welcomeNews: Boolean(
      welcomeNewsCreatedTenantId === tenantId ||
      (tenantQuery.isSuccess && welcomeNewsQuery.isSuccess && hasWelcomeNews),
    ),
  };
  const persistedSteps = onboarding.steps ?? {};
  const paymentDemoCompleted = paymentDemoCompletedTenantId === tenantId;
  const progressCompletion = {
    ...persistedSteps,
    ...actualCompletion,
    firstPayment: Boolean(persistedSteps.firstPayment) || paymentDemoCompleted,
    inviteProfessor:
      Boolean(persistedSteps.inviteProfessor) ||
      Boolean(hasValidProfessorInvitation),
    inviteStudent:
      Boolean(persistedSteps.inviteStudent) ||
      Boolean(hasValidStudentInvitation),
  };
  const completedCount =
    Object.values(progressCompletion).filter(Boolean).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const canContinue =
    step.id === "firstPayment"
      ? Boolean(persistedSteps.firstPayment) || paymentDemoCompleted
      : step.id === "inviteProfessor" ||
        !Object.hasOwn(actualCompletion, step.id) ||
        actualCompletion[step.id];

  let stepContent;

  switch (currentStep) {
    case 1:
      stepContent = (
        <p className="mt-4 leading-7 text-gray-600">
          ¡Bienvenido a TurnoFácil! Vamos a dejar tu espacio listo para que
          puedas empezar a usarlo.
        </p>
      );
      break;

    case 2:
      stepContent = (
        <ActivitiesStep
          tenantId={tenantId}
          isComplete={actualCompletion.activities}
        />
      );
      break;

    case 3:
      stepContent = (
        <ClassesStep
          tenantId={tenantId}
          isComplete={actualCompletion.firstClass}
        />
      );
      break;

    case 4:
      stepContent = (
        <InviteProfessorStep
          tenantId={tenantId}
          isComplete={Boolean(hasValidProfessorInvitation)}
        />
      );
      break;

    case 5:
      stepContent = (
        <SpecialitiesStep
          tenantId={tenantId}
          isComplete={actualCompletion.specialities}
        />
      );
      break;

    case 6:
      stepContent = (
        <StudentPlansStep
          tenantId={tenantId}
          isComplete={actualCompletion.studentPlans}
        />
      );
      break;

    case 7:
      stepContent = (
        <InviteStudentStep
          tenantId={tenantId}
          isComplete={Boolean(hasValidStudentInvitation)}
        />
      );
      break;

    case 8:
      stepContent = (
        <PaymentDemoStep
          tenantId={tenantId}
          isComplete={
            Boolean(persistedSteps.firstPayment) || paymentDemoCompleted
          }
          onCompleted={() => setPaymentDemoCompletedTenantId(tenantId)}
        />
      );
      break;

    case 9:
      stepContent = (
        <WelcomeNewsStep
          tenantId={tenantId}
          tenantName={tenantQuery.data?.name}
          isLoading={tenantQuery.isLoading || welcomeNewsQuery.isLoading}
          isError={tenantQuery.isError || welcomeNewsQuery.isError}
          isComplete={actualCompletion.welcomeNews}
          onRetry={() => {
            tenantQuery.refetch();
            welcomeNewsQuery.refetch();
          }}
          onCreated={() => setWelcomeNewsCreatedTenantId(tenantId)}
        />
      );
      break;

    default:
      stepContent = (
        <p className="mt-4 text-gray-600">
          ¡Ya casi está todo listo! Completaste el recorrido inicial de
          TurnoFácil y tu espacio está preparado para empezar. Cuando quieras,
          podés continuar a tu espacio y seguir configurando tu negocio.
        </p>
      );
  }

  return (
    <MainLayout>
      <div className="mt-12 max-w-5xl w-full">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#fc697b]">
            CONFIGURACIÓN INICIAL
          </p>

          <div className="mt-2 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Configurá tu negocio</h1>

            <span className="shrink-0 text-sm text-gray-500">
              Paso {currentStep} de {steps.length}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#fafafa]">
            <div
              className="h-full rounded-full bg-[#fc697b] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="rounded-lg border border-gray-400 bg-[#EFECF0] p-6 sm:p-8 shadow-md min-[900px]:min-h-100 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{step.title}</h2>

            {stepContent}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 w-full gap-2 min-[500px]:flex min-[500px]:justify-between">
              <BlackButton
                text="Anterior"
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || updateStepMutation.isPending}
                wfit={isSmallScreen}
                textSmall
              />
              <div className="hidden min-[500px]:flex gap-2">
                {!(currentStep === 10) && (
                  <WhiteButton
                    text="Continuar más tarde"
                    type="button"
                    onClick={handleLater}
                    wfit={isSmallScreen}
                    textSmall
                  />
                )}

                <RedButton
                  text={
                    updateStepMutation.isPending ||
                    completeStepMutation.isPending
                      ? step.id === "finish"
                        ? "Finalizando..."
                        : "Guardando..."
                      : !(currentStep === 10)
                        ? "Continuar"
                        : "Finalizar"
                  }
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !canContinue ||
                    updateStepMutation.isPending ||
                    completeStepMutation.isPending
                  }
                  wfit={isSmallScreen}
                  textSmall
                />
              </div>
              <div className="flex min-[500px]:hidden">
                <RedButton
                  text={
                    updateStepMutation.isPending ||
                    completeStepMutation.isPending
                      ? step.id === "finish"
                        ? "Finalizando..."
                        : "Guardando..."
                      : "Continuar"
                  }
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !canContinue ||
                    updateStepMutation.isPending ||
                    completeStepMutation.isPending
                  }
                  wfit={isSmallScreen}
                  textSmall
                />
              </div>
            </div>
            <div className="flex w-full min-[500px]:hidden">
              <WhiteButton
                text="Continuar más tarde"
                type="button"
                onClick={handleLater}
                wfit={isSmallScreen}
                textSmall
              />
            </div>
          </div>

          {navigationError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {navigationError}
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
