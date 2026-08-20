import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AdaptiveCanvas } from "../../components/AdaptiveCanvas";

const bodies = [
  { name: "बुध", radius: 1.15, size: .12, color: "#9b7c54", roughness: .85, speed: .24 },
  { name: "शुक्र", radius: 1.55, size: .18, color: "#d9a85c", roughness: .7, speed: .18 },
  { name: "पृथ्वी", radius: 2.02, size: .2, color: "#416d70", roughness: .66, speed: .14 },
  { name: "मंगल", radius: 2.48, size: .16, color: "#9d3f22", roughness: .88, speed: .11 },
  { name: "गुरु", radius: 3.05, size: .3, color: "#b98b5c", roughness: .72, speed: .075 },
  { name: "शनि", radius: 3.7, size: .25, color: "#c7aa72", roughness: .75, speed: .055, ring: true },
];

function OrbitLine({ radius }) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * .72, 0, Math.PI * 2);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(96).map(({ x, y }) => new THREE.Vector3(x, 0, y)));
  }, [radius]);
  return <line geometry={geometry} rotation={[.08, 0, 0]}><lineBasicMaterial color="#b8892d" transparent opacity={.22} /></line>;
}

function Planet({ body, index, quality }) {
  const group = useRef(null);
  const planet = useRef(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * body.speed;
    planet.current.rotation.y += delta * .24;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * .08 + index) * .025;
  });
  return <group ref={group} rotation={[0, index * .85, 0]}>
    <group position={[body.radius, 0, 0]}>
      <mesh ref={planet} castShadow={quality === "full"}>
        <sphereGeometry args={[body.size, quality === "full" ? 40 : 22, quality === "full" ? 40 : 22]} />
        <meshStandardMaterial color={body.color} roughness={body.roughness} metalness={.08} bumpScale={.08} />
      </mesh>
      {body.ring ? <mesh rotation={[Math.PI / 2.45, 0, 0]}><ringGeometry args={[.34,.53,64]} /><meshStandardMaterial color="#bd9650" side={THREE.DoubleSide} transparent opacity={.72} /></mesh> : null}
    </group>
  </group>;
}

function System({ quality }) {
  const root = useRef(null);
  useFrame((state, delta) => {
    root.current.rotation.y += delta * .018;
    root.current.rotation.x = -.12 + state.pointer.y * .04;
    root.current.rotation.z = state.pointer.x * .035;
  });
  return <>
    <ambientLight intensity={.24} />
    <pointLight position={[0, 0, 0]} intensity={quality === "full" ? 42 : 25} color="#ffbf54" distance={9} decay={2} />
    <directionalLight position={[4, 5, 3]} intensity={1.3} color="#fff0bf" />
    <group ref={root} rotation={[-.12, 0, 0]}>
      <Float speed={.45} rotationIntensity={.06} floatIntensity={.12}>
        <mesh>
          <sphereGeometry args={[.52, 48, 48]} />
          <meshStandardMaterial color="#f0a62d" emissive="#e87b12" emissiveIntensity={2.8} roughness={.5} />
        </mesh>
        <pointLight intensity={18} distance={5} color="#ffd174" />
      </Float>
      {bodies.map((body, index) => <group key={body.name}><OrbitLine radius={body.radius} /><Planet body={body} index={index} quality={quality} /></group>)}
    </group>
    {quality === "full" ? <Sparkles count={38} scale={[9,4,5]} size={1.2} speed={.08} color="#e9c478" opacity={.42} /> : null}
    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.8} rotateSpeed={.18} />
  </>;
}

export function PlanetarySystem3D({ label = "धीरे घूमता त्रि-आयामी ग्रह मंडल", fallback = null }) {
  return <AdaptiveCanvas className="dp-planetary-canvas" label={label} fallback={fallback} camera={{ position: [0, 4.8, 7.2], fov: 40 }}>
    <System quality={window.innerWidth > 1100 ? "full" : "lite"} />
  </AdaptiveCanvas>;
}
