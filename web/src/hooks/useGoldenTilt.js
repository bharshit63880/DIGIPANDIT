import { useCallback, useRef } from "react";
import { useMotionPreferences } from "./useMotionPreferences";

export function useGoldenTilt(max = 5) {
  const ref = useRef(null);
  const { reduced } = useMotionPreferences();
  const onPointerMove = useCallback((event) => {
    if (reduced || event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty("--tilt-x", `${-y * max}deg`);
    ref.current.style.setProperty("--tilt-y", `${x * max}deg`);
    ref.current.style.setProperty("--light-x", `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty("--light-y", `${(y + 0.5) * 100}%`);
  }, [max, reduced]);
  const reset = useCallback(() => {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  }, []);
  return { ref, onPointerMove, onPointerLeave: reset, onBlur: reset };
}
