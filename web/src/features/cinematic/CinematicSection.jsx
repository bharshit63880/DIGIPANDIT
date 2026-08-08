import { useCallback } from "react";
import { useJourney } from "./JourneyProvider";

export function CinematicSection({ id, label, className = "", children }) {
  const { registerSection } = useJourney();
  const ref = useCallback((node) => registerSection(id, node), [id, registerSection]);
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-heading`} data-cinematic-section={id} className={`cinematic-section ${className}`}>
      {children}
      <span className="sr-only">{label}</span>
    </section>
  );
}
