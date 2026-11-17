import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./modals/modal";
import RedButton from "./buttons/red-button";

const VERSION_ENDPOINT = "/app-version.json";
const KNOWN_VERSION_KEY = "turnofacil-known-app-version";
const CONFIRMED_VERSION_KEY = "turnofacil-confirmed-app-version";
const VERSION_CHECK_INTERVAL_MS = 60_000;

function getKnownVersion() {
  return (
    window.localStorage.getItem(KNOWN_VERSION_KEY) ??
    window.localStorage.getItem(CONFIRMED_VERSION_KEY)
  );
}

async function fetchPublishedVersion() {
  const response = await fetch(
    `${VERSION_ENDPOINT}?t=${Date.now()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Version check failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.version === undefined || data.version === null) {
    throw new Error("Published app version is missing");
  }

  return String(data.version);
}

export default function UpdateAvailableModal() {
  const { t } = useTranslation();
  const [availableVersion, setAvailableVersion] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkForUpdate = async () => {
      try {
        const publishedVersion = await fetchPublishedVersion();

        const knownVersion = getKnownVersion();

        if (!knownVersion) {
          window.localStorage.setItem(
            KNOWN_VERSION_KEY,
            publishedVersion,
          );
          return;
        }

        if (isMounted && knownVersion !== publishedVersion) {
          setAvailableVersion(publishedVersion);
        }
      } catch (error) {
        console.warn("No se pudo comprobar la versión publicada.", error);
      }
    };

    checkForUpdate();
    const intervalId = window.setInterval(
      checkForUpdate,
      VERSION_CHECK_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleAccept = () => {
    if (availableVersion === null) return;

    window.localStorage.setItem(
      KNOWN_VERSION_KEY,
      availableVersion,
    );
    window.localStorage.setItem(
      CONFIRMED_VERSION_KEY,
      availableVersion,
    );
    window.location.reload();
  };

  if (availableVersion === null) return null;

  return (
    <Modal
      open
      onClose={() => {}}
      isSuccesOrError
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="bg-[#fc697b] flex justify-center py-10">
        <RefreshCw className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-8 gap-2 my-5">
        <h4 className="font-semibold text-2xl">
          {t("common.updateAvailable")}
        </h4>
        <p className="text-xl">{t("common.updateAvailableMessage")}</p>
        <RedButton
          onClick={handleAccept}
          text={t("common.accept")}
          textSmall
          wfit
        />
      </div>
    </Modal>
  );
}
