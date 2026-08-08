import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const JourneyContext = createContext(null);

function getCapability(reducedMotion) {
  if (import.meta.env.DEV) {
    const requested = new URLSearchParams(window.location.search).get("cinematicMode");
    if (["full", "lite", "static"].includes(requested)) return requested;
  }
  if (reducedMotion || typeof window === "undefined") return "static";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const weakDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);
  return coarse || weakDevice || window.innerWidth < 900 ? "lite" : "full";
}

export function JourneyProvider({ children }) {
  const sections = useRef(new Map());
  const frame = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [capability, setCapability] = useState("static");
  const [progress, setProgress] = useState({ home: 0, "pandit-discovery": 0 });
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateCapability = () => {
      setReducedMotion(query.matches);
      setCapability(getCapability(query.matches));
    };
    updateCapability();
    query.addEventListener?.("change", updateCapability);
    window.addEventListener("resize", updateCapability, { passive: true });
    return () => {
      query.removeEventListener?.("change", updateCapability);
      window.removeEventListener("resize", updateCapability);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      frame.current = 0;
      const next = {};
      let closest = { id: "home", distance: Infinity };
      sections.current.forEach((node, id) => {
        const rect = node.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        next[id] = Math.min(1, Math.max(0, -rect.top / travel));
        const distance = Math.abs(rect.top - window.innerHeight * 0.28);
        if (rect.bottom > 80 && distance < closest.distance) closest = { id, distance };
      });
      setProgress((current) => {
        const changed = Object.keys(next).some((id) => Math.abs((current[id] || 0) - next[id]) > 0.012);
        return changed ? { ...current, ...next } : current;
      });
      setActiveSection((current) => current === closest.id ? current : closest.id);
    };
    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    let hashFrame = 0;
    const navigateToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      if (hashFrame) window.cancelAnimationFrame(hashFrame);
      hashFrame = window.requestAnimationFrame(() => {
        hashFrame = 0;
        document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    };
    navigateToHash();
    window.addEventListener("popstate", navigateToHash);
    window.addEventListener("hashchange", navigateToHash);
    return () => {
      if (hashFrame) window.cancelAnimationFrame(hashFrame);
      window.removeEventListener("popstate", navigateToHash);
      window.removeEventListener("hashchange", navigateToHash);
    };
  }, []);

  const registerSection = useCallback((id, node) => {
    if (node) sections.current.set(id, node);
    else sections.current.delete(id);
  }, []);

  const value = useMemo(() => ({
    activeSection,
    capability,
    progress,
    reducedMotion,
    registerSection,
  }), [activeSection, capability, progress, reducedMotion, registerSection]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error("useJourney must be used inside JourneyProvider");
  return value;
}
