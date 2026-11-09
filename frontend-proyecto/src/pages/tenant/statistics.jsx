import { createElement, lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { IoArrowBack } from "react-icons/io5";
import { Redirect, useLocation } from "wouter";
import MainLayout from "../../layouts/main-layout";
import Loading from "../../components/loading";
import { formatNumber, getLocale } from "../../utils/formatting";
import {
  getTenantById,
  getTenantClassStatistics,
  getTenantPaymentStatistics,
  getTenantProfessorStatistics,
  getTenantStatisticsSummary,
  getTenantStudentStatistics,
} from "../../services/tenant";

const StatisticsBarChart = lazy(() =>
  import("recharts").then(
    ({
      Bar,
      BarChart,
      CartesianGrid,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    }) => ({
      default: function StatisticsBarChart({
        data,
        xDataKey,
        yTickFormatter,
        yAxisWidth,
        dataKey,
        name,
        tooltipFormatter,
      }) {
        return createElement(
          ResponsiveContainer,
          { width: "100%", height: "100%" },
          createElement(
            BarChart,
            {
              data,
              margin: { top: 8, right: 8, left: 8, bottom: 48 },
            },
            createElement(CartesianGrid, {
              strokeDasharray: "3 3",
              stroke: "#d1cbd3",
            }),
            createElement(XAxis, {
              dataKey: xDataKey,
              angle: -35,
              textAnchor: "end",
              height: 56,
              tick: { fill: "#6b7280", fontSize: 11 },
              interval: "preserveStartEnd",
            }),
            createElement(YAxis, {
              allowDecimals: !yTickFormatter,
              tickFormatter: yTickFormatter,
              tick: { fill: "#6b7280", fontSize: yTickFormatter ? 11 : 12 },
              width: yAxisWidth,
            }),
            createElement(Tooltip, {
              formatter: tooltipFormatter,
              contentStyle: {
                backgroundColor: "#F1EEF3",
                borderColor: "#9ca3af",
                borderRadius: 8,
              },
            }),
            createElement(Bar, {
              dataKey,
              name,
              fill: "#fc697b",
              radius: [4, 4, 0, 0],
            }),
          ),
        );
      },
    }),
  ),
);

const PERIODS = [
  { value: "month", key: "periodThisMonth" },
  { value: "last3months", key: "periodLastThreeMonths" },
  { value: "year", key: "periodThisYear" },
  { value: "all", key: "periodAllTime" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
const formatCompactCurrency = (value) =>
  new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "ARS",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);

const LEGACY_DELIVERY_TRACKING_UNAVAILABLE =
  "El sistema no registra si una clase programada se dictó efectivamente. El estado Completed de una reserva se asigna automáticamente cuando pasa el horario y no representa asistencia.";

const translateStatisticsMessage = (t, reason) => {
  const reasonCode =
    reason === LEGACY_DELIVERY_TRACKING_UNAVAILABLE
      ? "CLASS_TRACKING_UNAVAILABLE"
      : reason;

  return t(`statistics.messages.${reasonCode}`, {
    defaultValue: reason ?? "",
  });
};

function PeriodSelect({ value, onChange, label }) {
  const { t } = useTranslation();
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-gray-400 bg-[#f1eef3] p-2 text-gray-700 cursor-pointer"
      >
        {PERIODS.map((period) => (
          <option key={period.value} value={period.value}>
            {t(`statistics.${period.key}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, period, setPeriod, children }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-gray-400 bg-[#efecf0] p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {period !== undefined && (
          <PeriodSelect
            value={period}
            onChange={setPeriod}
            label={t("statistics.period")}
          />
        )}
      </div>
      {children}
    </section>
  );
}

function LoadingOrError({ isLoading, isError, children }) {
  const { t } = useTranslation();
  if (isLoading) return <Loading />;
  if (isError) {
    return (
      <p className="rounded-lg text-sm bg-red-50 p-4 text-red-600 border border-red-600">
        {t("statistics.loadError")}
      </p>
    );
  }
  return children;
}

function Empty({ children }) {
  const { t } = useTranslation();
  return (
    <p className="py-6 text-center text-gray-500">
      {children || t("statistics.noData")}
    </p>
  );
}

export default function Statistics({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [summaryPeriod, setSummaryPeriod] = useState("month");
  const [classesPeriod, setClassesPeriod] = useState("month");
  const [professorsPeriod, setProfessorsPeriod] = useState("month");
  const [paymentsPeriod, setPaymentsPeriod] = useState("month");

  const tenant = useQuery({
    queryKey: ["tenantById", tenantId],
    queryFn: () => getTenantById(tenantId),
  });
  const isOwner = tenant.data?.role === "Tenant";

  const summary = useQuery({
    queryKey: ["tenantStatistics", tenantId, "summary", summaryPeriod],
    queryFn: () => getTenantStatisticsSummary(tenantId, summaryPeriod),
    enabled: isOwner,
  });
  const classes = useQuery({
    queryKey: ["tenantStatistics", tenantId, "classes", classesPeriod],
    queryFn: () => getTenantClassStatistics(tenantId, classesPeriod),
    enabled: isOwner,
  });
  const students = useQuery({
    queryKey: ["tenantStatistics", tenantId, "students"],
    queryFn: () => getTenantStudentStatistics(tenantId),
    enabled: isOwner,
  });
  const professors = useQuery({
    queryKey: ["tenantStatistics", tenantId, "professors", professorsPeriod],
    queryFn: () => getTenantProfessorStatistics(tenantId, professorsPeriod),
    enabled: isOwner,
  });
  const payments = useQuery({
    queryKey: ["tenantStatistics", tenantId, "payments", paymentsPeriod],
    queryFn: () => getTenantPaymentStatistics(tenantId, paymentsPeriod),
    enabled: isOwner,
  });

  if (tenant.isLoading) return <Loading />;
  if (!isOwner) return <Redirect to={`/mi-espacio/${tenantId}`} />;

  const summaryCards = [
    { title: t("statistics.activeStudents"), value: summary.data?.activeStudents },
    { title: t("statistics.periodReservations"), value: summary.data?.reservations },
    {
      title: t("statistics.averageOccupancy"),
      value:
        summary.data?.averageOccupancyPercentage == null
          ? t("tenants.notProvided")
          : `${summary.data.averageOccupancyPercentage}%`,
    },
    {
      title: t("statistics.recordedRevenue"),
      value: formatCurrency(summary.data?.recordedRevenue),
    },
  ];

  return (
    <MainLayout>
      <main className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-6">
        <button
          onClick={() => setLocation(`/mi-espacio/${tenantId}`)}
          className="flex items-center gap-2 self-start text-gray-500 transition hover:text-black"
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>

        <header>
          <h1 className="text-4xl font-bold min-[900px]:text-5xl">
            {t("statistics.title")}
          </h1>
          <p className="mt-3 text-gray-500">
            {t("statistics.subtitle")}
          </p>
        </header>

        <Section
          title={t("statistics.summary")}
          period={summaryPeriod}
          setPeriod={setSummaryPeriod}
        >
          <LoadingOrError
            isLoading={summary.isLoading}
            isError={summary.isError}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-lg border border-gray-400 bg-[#F1EEF3] p-4"
                >
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-[#fc697b]">
                    {card.value ?? "—"}
                  </p>
                </article>
              ))}
            </div>
            {summary.data?.occupancyUnavailableReason && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-600">
                {translateStatisticsMessage(
                  t,
                  summary.data.occupancyUnavailableReason,
                )}
              </p>
            )}
          </LoadingOrError>
        </Section>

        <Section
          title={t("statistics.classesAndAttendance")}
          period={classesPeriod}
          setPeriod={setClassesPeriod}
        >
          <LoadingOrError
            isLoading={classes.isLoading}
            isError={classes.isError}
          >
            {!classes.data?.deliveryTrackingAvailable ? (
              <p className="rounded-lg text-sm bg-red-50 p-4 text-red-600 border border-red-600">
                {translateStatisticsMessage(t, classes.data?.unavailableReason)}
              </p>
            ) : (
              <>
                <h3 className="mb-3 font-semibold">{t("statistics.occupancyByDay")}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {classes.data.weekdayOccupancy.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="rounded-lg bg-[#F1EEF3] p-3 border border-gray-400"
                    >
                      <p className="font-medium">
                        {t(`statistics.weekdays.${day.dayOfWeek}`, {
                          defaultValue: day.dayName,
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {day.occupancyPercentage}% · {day.occupiedSpots}/
                        {day.availableSpots} {t("statistics.spots")}
                      </p>
                    </div>
                  ))}
                </div>
                <h3 className="mb-3 mt-6 font-semibold">
                  {t("statistics.occupancyByActivity")}
                </h3>
                {classes.data.activityOccupancy.length ? (
                  <div className="space-y-3">
                    {classes.data.activityOccupancy.map((activity) => (
                      <div key={activity.activityId}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{activity.activityName}</span>
                          <span>{activity.occupancyPercentage}%</span>
                        </div>
                        <div className="h-2 rounded bg-gray-200">
                          <div
                            className="h-2 rounded bg-[#fc697b]"
                            style={{
                              width: `${activity.occupancyPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </>
            )}
          </LoadingOrError>
        </Section>

        <Section title={t("statistics.students")}>
          <LoadingOrError
            isLoading={students.isLoading}
            isError={students.isError}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg bg-[#F1EEF3] border border-gray-400 p-4">
                <p className="text-sm text-gray-500">{t("statistics.activeStudents")}</p>
                <p className="text-2xl font-bold">
                  {students.data?.activeStudents}
                </p>
              </article>
              <article className="rounded-lg bg-[#F1EEF3] border border-gray-400 p-4">
                <p className="text-sm text-gray-500">{t("statistics.newThisMonth")}</p>
                <p className="text-2xl font-bold">
                  {students.data?.newStudentsThisMonth}
                </p>
              </article>
              <article className="rounded-lg bg-[#F1EEF3] border border-gray-400 p-4">
                <p className="text-sm text-gray-500">{t("statistics.newLastThreeMonths")}</p>
                <p className="text-2xl font-bold">
                  {students.data?.newStudentsLastThreeMonths}
                </p>
              </article>
              <article className="rounded-lg bg-[#F1EEF3] border border-gray-400 p-4">
                <p className="text-sm text-gray-500">{t("statistics.newThisYear")}</p>
                <p className="text-2xl font-bold">
                  {students.data?.newStudentsThisYear}
                </p>
              </article>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">{t("statistics.monthlyEvolution")}</h3>
                {students.data?.monthlyEvolution.some(
                  (entry) => entry.newStudents > 0,
                ) ? (
                  <div className="h-72 w-full min-w-0">
                    <Suspense
                      fallback={
                        <div className="flex h-full items-center">
                          <Loading />
                        </div>
                      }
                    >
                      <StatisticsBarChart
                        data={students.data.monthlyEvolution}
                        xDataKey="month"
                        dataKey="newStudents"
                        name={t("statistics.newStudentsSeries")}
                        tooltipFormatter={(value) => [
                          value,
                          t("statistics.tooltips.newStudents", { count: value }),
                        ]}
                      />
                    </Suspense>
                  </div>
                ) : (
                  <Empty />
                )}
              </div>
              <div>
                <h3 className="mb-3 font-semibold">{t("statistics.studentsByPlan")}</h3>
                {students.data?.studentsByPlan.length ? (
                  <div className="space-y-2">
                    {students.data.studentsByPlan.map((plan) => (
                      <div
                        key={plan.studentPlanId}
                        className="flex justify-between rounded-lg bg-[#F1EEF3] border border-gray-400 p-3"
                      >
                        <span>{plan.studentPlanName}</span>
                        <span className="font-semibold">{plan.students}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </div>
            </div>
          </LoadingOrError>
        </Section>

        <Section
          title={t("statistics.professors")}
          period={professorsPeriod}
          setPeriod={setProfessorsPeriod}
        >
          <LoadingOrError
            isLoading={professors.isLoading}
            isError={professors.isError}
          >
            {!professors.data?.deliveryTrackingAvailable && (
              <p className="mb-4 rounded-lg text-sm bg-red-50 p-4 text-red-600 border border-red-600">
                {translateStatisticsMessage(
                  t,
                  professors.data?.unavailableReason,
                )}
              </p>
            )}
            {professors.data?.professors.length ? (
              <div className="space-y-2">
                {professors.data.professors.map((professor) => (
                  <article
                    key={professor.professorId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F1EEF3] border border-gray-400 p-4"
                  >
                    <p className="font-medium">
                      {professor.name} {professor.surname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("statistics.classesTaught")}:{" "}
                      {professor.classesTaught == null
                        ? t("tenants.notProvided")
                        : professor.classesTaught}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <Empty>{t("statistics.noActiveProfessors")}</Empty>
            )}
          </LoadingOrError>
        </Section>

        <Section
          title={t("statistics.payments")}
          period={paymentsPeriod}
          setPeriod={setPaymentsPeriod}
        >
          <LoadingOrError
            isLoading={payments.isLoading}
            isError={payments.isError}
          >
            <p className="mb-4 text-2xl font-bold text-[#fc697b]">
              {t("statistics.revenue")}: {formatCurrency(payments.data?.totalRevenue)}
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">{t("statistics.revenueByPeriod")}</h3>
                {payments.data?.revenueByPeriod.length ? (
                  <div className="h-72 w-full min-w-0">
                    <Suspense
                      fallback={
                        <div className="flex h-full items-center">
                          <Loading />
                        </div>
                      }
                    >
                      <StatisticsBarChart
                        data={payments.data.revenueByPeriod}
                        xDataKey="period"
                        yTickFormatter={formatCompactCurrency}
                        yAxisWidth={72}
                        dataKey="amount"
                        name={t("statistics.revenue")}
                        tooltipFormatter={(value) => [
                          formatCurrency(Number(value)),
                          t("statistics.revenue"),
                        ]}
                      />
                    </Suspense>
                  </div>
                ) : (
                  <Empty />
                )}
              </div>
              <div>
                <h3 className="mb-3 font-semibold">
                  {t("statistics.paymentMethodsByCount")}
                </h3>
                {payments.data?.paymentsByMethod.length ? (
                  <div className="space-y-2">
                    {payments.data.paymentsByMethod.map((method) => (
                      <div
                        key={method.method}
                        className="flex justify-between rounded-lg bg-[#F1EEF3] border border-gray-400 p-3"
                      >
                        <span className="mr-2">
                          {t(`statistics.paymentMethods.${method.method}`, {
                            defaultValue: method.method,
                          })}
                        </span>
                        <span>
                          {formatNumber(method.payments)}{" "}
                          {t("statistics.paymentsCount")} ·{" "}
                          {formatNumber(method.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty />
                )}
              </div>
            </div>
          </LoadingOrError>
        </Section>
      </main>
    </MainLayout>
  );
}
