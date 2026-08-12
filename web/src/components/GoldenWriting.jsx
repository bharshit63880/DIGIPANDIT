import { useEffect, useRef, useState } from "react";
import { useMotionPreferences } from "../hooks/useMotionPreferences";

export function GoldenWriting({ as: Tag = "h1", children, className = "", delay = 80 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const { reduced } = useMotionPreferences();
  useEffect(() => {
    if (reduced) { setVisible(true); return undefined; }
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { window.setTimeout(() => setVisible(true), delay); observer.disconnect(); }
    }, { threshold: 0.35 });
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [delay, reduced]);
  return <Tag ref={ref} className={`dp-golden-writing ${visible ? "is-written" : ""} ${className}`}><span>{children}</span><i aria-hidden="true" /></Tag>;
}
