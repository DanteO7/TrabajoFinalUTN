import { useState } from "react";
import { getClassTemplates } from "../../services/class-template";
import { useQuery } from "@tanstack/react-query";
import { hasOfficialClasses } from "../../services/class";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import ClassForm from "../classes/class-form";
import CopyClassTemplateDayModal from "../class-template/copy-class-template-day-modal";
import CopyClassTemplateWeekModal from "../class-template/copy-class-template-week-modal";
import ClassCard from "../classes/class-card";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../utils/formatting";

const days = [
  { value: 1, labelKey: "monday" },
  { value: 2, labelKey: "tuesday" },
  { value: 3, labelKey: "wednesday" },
  { value: 4, labelKey: "thursday" },
  { value: 5, labelKey: "friday" },
  { value: 6, labelKey: "saturday" },
  { value: 0, labelKey: "sunday" },
];

export default function ClassesStep({ tenantId, isComplete }) {
  const { t } = useTranslation();
  const [openDay, setOpenDay] = useState(null);

  const [openTemplateForm, setOpenTemplateForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const [openIndividualForm, setOpenIndividualForm] = useState(false);

  const [openCopyDayModal, setOpenCopyDayModal] = useState(false);
  const [openCopyWeekModal, setOpenCopyWeekModal] = useState(false);

  const {
    data: classTemplates = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["getClassTemplates", tenantId],
    queryFn: getClassTemplates,
    enabled: !!tenantId && !isComplete,
  });

  const {
    isLoading: isLoadingOfficialClasses,
    isError: isOfficialClassesError,
    refetch: refetchOfficialClasses,
  } = useQuery({
    queryKey: ["getClasses", tenantId, "exists"],
    queryFn: () => hasOfficialClasses(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading || isLoadingOfficialClasses) {
    return <Loading />;
  }

  if (isError || isOfficialClassesError) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {t("onboardingSteps.classesLoadError")}
        </p>
        <button
          type="button"
          onClick={() => {
            refetch();
            refetchOfficialClasses();
          }}
          className="mt-3 underline"
        >
          {t("onboardingSteps.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <p className="text-gray-600">
        {isComplete
          ? t("onboardingSteps.classesComplete")
          : t("onboardingSteps.classesDescription")}
      </p>

      {!isComplete && (
        <>
          <section>
            <h3 className="text-lg font-semibold">
              {t("onboardingSteps.templateWeekTitle")}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {t("onboardingSteps.templateWeekDescription")}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {t("onboardingSteps.templateWeekHint")}
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="mt-4">
                <BlackButton
                  text={t("onboardingSteps.copyWeek")}
                  wfit
                  textSmall
                  onClick={() => setOpenCopyWeekModal(true)}
                  disabled={classTemplates.length === 0}
                />
              </div>
              {days.map((day) => {
                const classesOfDay = classTemplates.filter(
                  (template) => template.dayOfWeek === day.value,
                );

                const isOpen = openDay === day.value;

                return (
                  <div
                    key={day.value}
                    className="overflow-hidden rounded-lg border border-gray-400 shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? null : day.value)}
                      className="flex w-full cursor-pointer items-center justify-between bg-[#EFECF0] px-5 py-4 transition"
                    >
                      <span className="text-lg font-semibold">
                        {t(`classForm.${day.labelKey}`)}
                      </span>

                      <span className="text-gray-500">
                        {t("onboardingSteps.classCount", {
                          count: classesOfDay.length,
                          formattedCount: formatNumber(classesOfDay.length),
                        })}
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-gray-400 p-4">
                          <div className="mb-4 flex flex-wrap justify-end gap-3">
                            <BlackButton
                              onClick={() => {
                                setSelectedDay(day.value);
                                setOpenTemplateForm(true);
                              }}
                              text={t("onboardingSteps.newClass")}
                              wfit
                              textSmall
                            />

                            {classesOfDay.length > 0 && (
                              <BlackButton
                                onClick={() => {
                                  setSelectedDay(day.value);
                                  setOpenCopyDayModal(true);
                                }}
                                text={t("onboardingSteps.copyDay")}
                                wfit
                                textSmall
                              />
                            )}
                          </div>
                          {classesOfDay.length > 0 ? (
                            <div className="mb-4 grid gap-3">
                              {classesOfDay.map((template) => (
                                <ClassCard
                                  key={template.id}
                                  classItem={{
                                    ...template,
                                    activityName:
                                      template.activity?.name ??
                                      template.activityName ??
                                      t("onboardingSteps.configuredClass"),
                                    professorName:
                                      template.professor?.user?.name ??
                                      template.professorName ??
                                      "",
                                    professorSurname:
                                      template.professor?.user?.surname ??
                                      template.professorSurname ??
                                      "",
                                    reservationsCount: 0,
                                    students: [],
                                  }}
                                  isSelected={false}
                                  canSelect={false}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="py-6 text-center text-gray-500">
                              {t("onboardingSteps.noClassesForDay")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold">
              {t("onboardingSteps.individualClassTitle")}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {t("onboardingSteps.individualClassDescription")}
            </p>

            <div className="mt-4">
              <BlackButton
                text={t("onboardingSteps.createIndividualClass")}
                onClick={() => setOpenIndividualForm(true)}
                wfit
                textSmall
              />
            </div>
          </section>
        </>
      )}

      {openTemplateForm && (
        <ClassForm
          key={`template-${selectedDay}`}
          tenantId={tenantId}
          defaultDayOfWeek={selectedDay}
          close={() => setOpenTemplateForm(false)}
          isTemplate
        />
      )}

      {openIndividualForm && (
        <ClassForm
          key="individual-class"
          tenantId={tenantId}
          close={() => setOpenIndividualForm(false)}
        />
      )}

      {openCopyDayModal && (
        <CopyClassTemplateDayModal
          tenantId={tenantId}
          dayOfWeek={selectedDay}
          close={() => setOpenCopyDayModal(false)}
        />
      )}
      {openCopyWeekModal && (
        <CopyClassTemplateWeekModal
          tenantId={tenantId}
          close={() => setOpenCopyWeekModal(false)}
        />
      )}
    </div>
  );
}
