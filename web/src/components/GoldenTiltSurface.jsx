import { useGoldenTilt } from "../hooks/useGoldenTilt";

export function GoldenTiltSurface({ as: Tag = "article", children, className = "", ...props }) {
  const tilt = useGoldenTilt();
  return <Tag ref={tilt.ref} data-golden-tilt="" onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} onBlur={tilt.onBlur} className={className} {...props}>{children}</Tag>;
}
