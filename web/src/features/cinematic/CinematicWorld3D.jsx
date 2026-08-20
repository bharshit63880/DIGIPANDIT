import { Environment, Float, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AdaptiveCanvas } from "../../components/AdaptiveCanvas";

const stageIndex = { home: 0, "pandit-discovery": .7, astrology: 1.5, "hawan-guide": 2.35, "puja-store": 3.15 };

function Flame({ visible }) {
  const group = useRef(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, visible ? 1 : .001, .055));
    group.current.rotation.y = Math.sin(t * 1.3) * .08;
    group.current.children.filter((child) => child.isMesh).forEach((child, index) => { child.scale.y = .82 + Math.sin(t * (2.5 + index * .3) + index) * .13; child.position.x = Math.sin(t * 2 + index) * .055; });
  });
  return <group ref={group} position={[1.9,-1.2,0]} scale={.001}>
    {[0,1,2].map((index)=><mesh key={index} position={[0,index*.18,0]} rotation={[0,0,index*.12-.12]}>
      <coneGeometry args={[.42-index*.08,1.45-index*.18,32]} />
      <meshStandardMaterial color={index===2?"#fff2aa":index===1?"#ff9b19":"#a72a08"} emissive={index===2?"#ffd25b":"#e84f0d"} emissiveIntensity={2.5-index*.4} transparent opacity={.72} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>)}
    <pointLight color="#ff7b19" intensity={16} distance={6} position={[0,.5,1]} />
  </group>;
}

function Kalash({ visible }) {
  const mesh = useRef(null);
  const points = useMemo(()=>[new THREE.Vector2(0,-.7),new THREE.Vector2(.55,-.55),new THREE.Vector2(.68,-.05),new THREE.Vector2(.52,.5),new THREE.Vector2(.3,.62),new THREE.Vector2(.36,.82),new THREE.Vector2(.58,.88)],[]);
  useFrame((state,delta)=>{if(!mesh.current)return; const target=visible?1:.001;mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x,target,.045));mesh.current.rotation.y+=delta*.16;mesh.current.position.y=-.8+Math.sin(state.clock.elapsedTime*.7)*.07;});
  return <Float speed={.7} floatIntensity={.16}><mesh ref={mesh} position={[2.1,-.8,0]} scale={.001} castShadow><latheGeometry args={[points,64]} /><meshStandardMaterial color="#b77a2c" metalness={.88} roughness={.25} envMapIntensity={1.4} /></mesh></Float>;
}

function World({ activeSection }) {
  const rig = useRef(null);
  const target = stageIndex[activeSection] ?? 0;
  useFrame((state)=>{if(!rig.current)return;rig.current.rotation.y=THREE.MathUtils.lerp(rig.current.rotation.y,target*.34,.025);rig.current.position.x=THREE.MathUtils.lerp(rig.current.position.x,-target*.22,.025);rig.current.position.y=THREE.MathUtils.lerp(rig.current.position.y,Math.sin(target)*.24,.025);rig.current.rotation.z=Math.sin(state.clock.elapsedTime*.13)*.012;});
  return <><ambientLight intensity={.18}/><directionalLight position={[-4,6,5]} intensity={2.1} color="#f4c96b" /><group ref={rig}>
    <mesh position={[1.7,.3,-1.8]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.35,.025,12,128]}/><meshStandardMaterial color="#b8892d" emissive="#806127" emissiveIntensity={.8}/></mesh>
    <mesh position={[1.7,.3,-1.8]} rotation={[Math.PI/2.35,.1,0]}><torusGeometry args={[1.72,.012,10,96]}/><meshStandardMaterial color="#f4c96b" emissive="#b8892d" emissiveIntensity={.65}/></mesh>
    <Sparkles count={target>1.3?58:22} scale={[7,5,4]} size={1.25} speed={target>2?1.1:.12} color={target>2?"#f06b1b":"#e5bd6c"} opacity={.52}/>
    <Flame visible={target>=2&&target<3}/><Kalash visible={target>=3}/>
  </group><Environment preset="warehouse" /></>;
}

export function CinematicWorld3D({ activeSection }) {
  return <AdaptiveCanvas className="journey-world-3d" label="स्क्रॉल के साथ बदलता त्रि-आयामी आध्यात्मिक दृश्य" camera={{position:[0,1.2,8],fov:43}}><World activeSection={activeSection}/></AdaptiveCanvas>;
}
