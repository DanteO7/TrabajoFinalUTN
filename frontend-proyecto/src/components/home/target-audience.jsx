import { Dumbbell, HeartPulse, Users, Waves, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export default function TargetAudience() {
  const items = [
    { icon: Dumbbell, label: "Gimnasios" },
    { icon: Flame, label: "Crossfit" },
    { icon: HeartPulse, label: "Pilates" },
    { icon: Waves, label: "Natación" },
    { icon: Users, label: "Clases grupales" },
  ];

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(4);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisible(1);
      } else if (window.innerWidth < 1024) {
        setVisible(2);
      } else {
        setVisible(4);
      }
    };

    updateVisible();
    window.addEventListener("resize", updateVisible);

    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
      setTransition(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (index === items.length) {
      setTimeout(() => {
        setTransition(false);
        setIndex(0);
      }, 500);
    }
  }, [index]);

  return (
    <section className="w-full">
      <h2 className="text-center text-3xl font-semibold">
        ¿Para quién es TurnoFacil?
      </h2>

      <div className="overflow-hidden mt-12">
        <div
          className={`flex ${
            transition ? "transition-transform duration-500" : ""
          }`}
          style={{
            transform: `translateX(-${index * (100 / visible)}%)`,
          }}
        >
          {[...items, ...items].map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                style={{ width: `${100 / visible}%` }}
                className="shrink-0 flex flex-col items-center gap-3"
              >
                <Icon size={50} className="text-[#333]" />
                <p className="text-lg font-semibold">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
