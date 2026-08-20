import { useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { AdaptiveCanvas } from "../../components/AdaptiveCanvas";
import { useMotionPreferences } from "../../hooks/useMotionPreferences";

function Flame({ mode }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current || mode !== "full") return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * .7) * .08;
    group.current.scale.y = 1 + Math.sin(t * 3.1) * .07;
  });
  return <group ref={group} position={[0, .55, 0]}>
    {[[0, 1.35, .56, "#ff6a00", .72], [.05, 1.02, .4, "#ffb51b", .86], [-.04, .68, .25, "#fff1a3", 1]].map(([x, height, radius, color, opacity], index) => <mesh key={color} position={[x, index * .08, index * .04]} rotation={[0, 0, index === 1 ? -.12 : .08]}>
      <coneGeometry args={[radius, height, 28, 1, true]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} transparent opacity={opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>)}
    <pointLight color="#ff9b26" intensity={8} distance={7} decay={2} />
  </group>;
}

function Kund({ mode }) {
  const embers = useRef();
  useFrame(({ clock }) => { if (embers.current && mode === "full") embers.current.rotation.y = clock.getElapsedTime() * .08; });
  return <group rotation={[-.08, .55, 0]}>
    {[0, .18, .36].map((height, index) => <mesh key={height} position={[0, -.65 - height, 0]}><boxGeometry args={[3.05 - index * .38, .28, 2.45 - index * .32]} /><meshStandardMaterial color={index === 0 ? "#32170b" : "#6d2e12"} metalness={.62} roughness={.34} /></mesh>)}
    <mesh position={[0, -.35, 0]}><boxGeometry args={[2.35, .32, 1.78]} /><meshStandardMaterial color="#a64b17" metalness={.55} roughness={.32} /></mesh>
    <mesh position={[0, -.15, 0]}><boxGeometry args={[1.85, .28, 1.3]} /><meshStandardMaterial color="#130805" metalness={.2} roughness={.8} /></mesh>
    <Flame mode={mode} />
    <group ref={embers}>{Array.from({ length: 18 }).map((_, index) => { const angle = index / 18 * Math.PI * 2; return <mesh key={index} position={[Math.cos(angle) * (1.4 + index % 3 * .18), .3 + index % 5 * .28, Math.sin(angle) * 1.05]}><sphereGeometry args={[.018 + index % 2 * .012, 8, 8]} /><meshBasicMaterial color={index % 2 ? "#ffbd3e" : "#ff5a0a"} /></mesh>; })}</group>
  </group>;
}

export default function HawanFire3D() {
  const { quality: mode } = useMotionPreferences();
  return <AdaptiveCanvas className="hj-fire-canvas" label="प्रज्वलित हवन कुंड का त्रि-आयामी दृश्य" camera={{ position: [0, 1.7, 5.8], fov: 39 }} fallback={<div className="hj-fire-fallback" />}>
    <><ambientLight intensity={.3} /><directionalLight position={[-3, 5, 4]} color="#ffd99a" intensity={2.6} /><Float speed={mode === "full" ? .75 : 0} rotationIntensity={.05} floatIntensity={.16}><Kund mode={mode} /></Float><Environment preset="warehouse" /></>
  </AdaptiveCanvas>;
}
