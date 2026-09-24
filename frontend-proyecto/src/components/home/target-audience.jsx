import { Dumbbell, HeartPulse, Users, Waves, Flame } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
export default function TargetAudience() {
  const items = [
    { icon: Dumbbell, label: "Gimnasios" },
    { icon: Flame, label: "Crossfit" },
    { icon: HeartPulse, label: "Pilates" },
    { icon: Waves, label: "Natación" },
    { icon: Users, label: "Clases grupales" },
  ];

  const [visible, setVisible] = useState(4);
  const [isDragging, setIsDragging] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const positionRef = useRef(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPositionRef = useRef(0);

  const setWidthRef = useRef(0);

  const speed = isDesktop ? 90 : 30;

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisible(3);
      } else if (window.innerWidth < 1024) {
        setVisible(4);
      } else {
        setVisible(5);
      }
    };

    updateVisible();

    window.addEventListener("resize", updateVisible);

    return () => {
      window.removeEventListener("resize", updateVisible);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      const itemWidth = containerRef.current.clientWidth / visible;

      setWidthRef.current = itemWidth * items.length;

      if (positionRef.current === 0) {
        positionRef.current = -setWidthRef.current;
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [visible, items.length]);

  const updatePosition = () => {
    if (!trackRef.current) return;

    trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
  };

  const normalizePosition = () => {
    const setWidth = setWidthRef.current;

    if (!setWidth) return;

    if (positionRef.current <= -setWidth * 2) {
      positionRef.current += setWidth;
    }

    if (positionRef.current >= 0) {
      positionRef.current -= setWidth;
    }
  };

  useEffect(() => {
    const animate = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;

      lastTimeRef.current = time;

      if (!draggingRef.current) {
        positionRef.current -= speed * deltaTime;

        normalizePosition();
        updatePosition();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = null;
    };
  }, [speed]);

  const handlePointerDown = (e) => {
    draggingRef.current = true;

    setIsDragging(true);

    startXRef.current = e.clientX;
    startPositionRef.current = positionRef.current;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;

    const difference = e.clientX - startXRef.current;

    positionRef.current = startPositionRef.current + difference;

    normalizePosition();
    updatePosition();
  };

  const handlePointerUp = (e) => {
    draggingRef.current = false;

    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section className="w-full">
      <h2 className="text-center text-3xl font-semibold">
        ¿Para quién es TurnoFacil?
      </h2>

      <div
        ref={containerRef}
        className={`overflow-hidden mt-12 touch-pan-y ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={trackRef} className="flex will-change-transform select-none">
          {[...items, ...items, ...items].map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                style={{
                  width: `${100 / visible}%`,
                }}
                className="shrink-0 flex flex-col items-center gap-2"
              >
                <Icon
                  size={visible === 3 ? 30 : 45}
                  className="text-[#fc697b]"
                />

                <p
                  className={`${
                    visible === 3 ? "text-[13px]" : "text-lg"
                  } font-semibold`}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
