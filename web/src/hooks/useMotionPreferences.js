import { useEffect, useState } from "react";

export function useMotionPreferences() {
  const [state, setState] = useState({ reduced: true, quality: "static" });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => {
      const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
      const reduced = motion.matches;
      setState({ reduced, quality: reduced ? "static" : coarse.matches || weak || window.innerWidth < 900 ? "lite" : "full" });
    };
    update();
    motion.addEventListener?.("change", update);
    coarse.addEventListener?.("change", update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      motion.removeEventListener?.("change", update);
      coarse.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
