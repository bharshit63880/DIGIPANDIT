import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

export function AdaptiveCanvas({ children, className = "", label = "सजावटी त्रि-आयामी दृश्य", fallback = null, camera = { position: [0, 1, 7], fov: 42 } }) {
  const host = useRef(null);
  const [active, setActive] = useState(false);
  const { quality } = useMotionPreferences();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "180px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={`dp-adaptive-canvas ${className}`} role="img" aria-label={label}>
    {quality === "static" || !active ? fallback : <Canvas dpr={quality === "full" ? [1, 1.5] : 1} frameloop={active ? "always" : "never"} camera={camera} gl={{ alpha: true, antialias: quality === "full", powerPreference: "high-performance" }}>
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>}
  </div>;
}
