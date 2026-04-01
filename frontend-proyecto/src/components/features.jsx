import {
  Users,
  Calendar,
  CreditCard,
  FileText,
  BarChart,
  Zap,
} from "lucide-react";
import FeatureCard from "./feature-card";

export default function Features() {
  return (
    <section>
      <h2 className="text-center font-semibold text-3xl">Características</h2>
      <div className="flex flex-col gap-14 mt-14 md:flex-row md:flex-wrap md:justify-center">
        <FeatureCard
          icon={Users}
          title="Clientes"
          text="Gestioná fácilmente tus alumnos con información clara y organizada. Controlá estados, asistencia y datos importantes desde un solo lugar."
        />
        <FeatureCard
          icon={Calendar}
          title="Turnos"
          text="Administrá clases y reservas de forma automática. Tus clientes pueden anotarse, cancelar o modificar turnos sin necesidad de contactarte."
        />
        <FeatureCard
          icon={CreditCard}
          title="Pagos"
          text="Llevá el control de pagos y planes de tus alumnos. Gestioná abonos, vencimientos y el estado de cada cliente, con la posibilidad de que paguen directamente desde la app de forma rápida y segura."
        />
        <FeatureCard
          icon={FileText}
          title="Informes"
          text="Obtené información clara sobre tu negocio: asistencia, alumnos activos, turnos ocupados y más para tomar mejores decisiones."
        />
        <FeatureCard
          icon={BarChart}
          title="Estadísticas"
          text="Visualizá el rendimiento de tu actividad con datos simples: ocupación de clases, crecimiento de alumnos y uso del sistema."
        />
        <FeatureCard
          icon={Zap}
          title="Automatización"
          text="Ahorrá tiempo automatizando tareas repetitivas. Turnos, cupos y gestión diaria funcionando sin esfuerzo."
        />
      </div>
    </section>
  );
}
