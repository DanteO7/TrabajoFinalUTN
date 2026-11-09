import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "../layouts/main-layout";
import Loading from "../components/loading";
import RedButton from "../components/buttons/red-button";
import ColorButton from "../components/buttons/color-button";
import { getPayment } from "../services/payment";
import { useTranslation } from "react-i18next";

export default function PaymentsResult() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);

  const paymentId = params.get("external_reference");

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => getPayment(paymentId),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="w-full max-w-100 mt-12">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  if (!paymentId || isError || !payment) {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            {t("payments.result.lookupError")}
          </h1>

          <p>{t("payments.result.notFound")}</p>

          <RedButton
            text={t("payments.backToPayments")}
            textSmall
            onClick={() => navigate("/")}
          />
        </div>
      </MainLayout>
    );
  }

  const goToPayments = () => {
    navigate(`/mi-espacio/${payment.tenantId}/pagos`);
  };

  if (payment.status === "Paid") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#1fc762] min-[900px]:text-2xl">
            {t("payments.result.approvedTitle")}
          </h1>

          <p>{t("payments.result.approved")}</p>

          <ColorButton
            text={t("payments.backToPayments")}
            textSmall
            onClick={goToPayments}
            bgColor="#1fc762"
            textColor="#efefef"
            hoverColor="#18b356"
            disabledColor="#6dda98"
          />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Pending") {
    return (
      <MainLayout>
        <div className="border border-gray-400 mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#e5a400] min-[900px]:text-2xl">
            {t("payments.result.pendingTitle")}
          </h1>

          <p>
            {t("payments.result.pending")}
          </p>

          <ColorButton
            text={t("payments.backToPayments")}
            textSmall
            onClick={goToPayments}
            bgColor="#e5a400"
            textColor="#efefef"
            hoverColor="#c99000"
            disabledColor="#e5c766"
          />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Rejected") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            {t("payments.result.rejectedTitle")}
          </h1>

          <p>{t("payments.result.rejected")}</p>

          <RedButton text={t("payments.backToPayments")} textSmall onClick={goToPayments} />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Cancelled") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            {t("payments.result.cancelledTitle")}
          </h1>

          <p>{t("payments.result.cancelled")}</p>

          <RedButton text={t("payments.backToPayments")} textSmall onClick={goToPayments} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border mt-12 p-4 rounded-lg flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
        <h1 className="font-semibold text-[19px] min-[900px]:text-2xl">
          {t("payments.result.statusTitle")}
        </h1>

        <p>{t("payments.result.currentStatus", { status: payment.status })}</p>

        <ColorButton
          text={t("payments.backToPayments")}
          textSmall
          onClick={goToPayments}
          bgColor="#333"
          textColor="#efefef"
          hoverColor="#222"
          disabledColor="#777"
        />
      </div>
    </MainLayout>
  );
}
