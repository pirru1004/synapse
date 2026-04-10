"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface PlanetData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface UniverseProps {
  planets: PlanetData[];
}

// Automatically animate the camera to focus on the target position
function CameraController({ targetPosition }: { targetPosition: [number, number, number] | null }) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  const target = new THREE.Vector3();

  useEffect(() => {
    if (targetPosition) {
      target.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  }, [targetPosition]);

  useFrame(() => {
    if (targetPosition) {
      // Lerp camera position slightly offset from the target
      vec.set(target.x, target.y + Math.max(8, targetPosition[1] + 5), target.z + Math.max(20, targetPosition[2] + 10));
      camera.position.lerp(vec, 0.05);
    }
  });

  return null;
}

function Planet({ data, onClick }: { data: PlanetData, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Simple rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? 0.02 : 0.005;
      meshRef.current.rotation.x += 0.001;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.002;
    }
  });

  return (
    <group position={data.position}>
      {/* Planet Sphere */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : data.color}
          roughness={0.4}
          metalness={0.1}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
        />
      </mesh>

      {/* Decorative Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[data.size * 1.5, data.size * 1.6, 64]} />
        <meshBasicMaterial
          color={data.color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Render the label slightly above the planet */}
      <Text
        position={[0, data.size + 1.2, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff"
      >
        {data.name}
      </Text>
    </group>
  );
}

export function Universe({ planets }: UniverseProps) {
  // We keep track of the currently "locked" target coordinate
  const [activeTarget, setActiveTarget] = useState<[number, number, number] | null>(null);

  // Whenever a new search happens and planets are added, auto-lock onto the first new planet of the cluster!
  useEffect(() => {
    if (planets.length > 0) {
      // The newest cluster is the last 5 elements, but looking at the very first one in the new array is fine
      setActiveTarget(planets[planets.length - 1].position);
    }
  }, [planets]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050510] z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <Stars
          radius={100}
          depth={50}
          count={7000}
          factor={8}
          saturation={0}
          fade
          speed={1.5}
        />

        {planets.map((p) => (
          <Planet 
            key={p.id} 
            data={p} 
            onClick={() => setActiveTarget(p.position)}
          />
        ))}

        <CameraController targetPosition={activeTarget} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          target={activeTarget ? new THREE.Vector3(...activeTarget) : new THREE.Vector3(0, 0, 0)}
        />
      </Canvas>
    </div>
  );
}
