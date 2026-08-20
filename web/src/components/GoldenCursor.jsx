import { useEffect, useRef } from "react";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

export function GoldenCursor() {
  const core = useRef(null);
  const ring = useRef(null);
  const { reduced } = useMotionPreferences();

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer:fine)").matches) return undefined;
    let frame = 0;
    let targetX = -40; let targetY = -40; let ringX = -40; let ringY = -40;
    const draw = () => {
      ringX += (targetX - ringX) * 0.2;
      ringY += (targetY - ringY) * 0.2;
      core.current?.style.setProperty("transform", `translate3d(${targetX}px,${targetY}px,0)`);
      ring.current?.style.setProperty("transform", `translate3d(${ringX}px,${ringY}px,0)`);
      frame = requestAnimationFrame(draw);
    };
    const move = (event) => { targetX = event.clientX; targetY = event.clientY; };
    const over = (event) => ring.current?.toggleAttribute("data-active", Boolean(event.target.closest("a,button,[role=button]")));
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); document.removeEventListener("pointerover", over); };
  }, [reduced]);

  if (reduced) return null;
  return <div className="dp-cursor" aria-hidden="true"><i ref={ring} /><b ref={core} /></div>;
}
