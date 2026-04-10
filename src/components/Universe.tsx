"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text, PositionalAudio, Billboard, Image, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

// Shared global registry for the Reactive Background
const GlobalAudioState = {
  dominantFrequency: 0,
  dominantColor: new THREE.Color("#050510"),
  closestDistance: Infinity,
};

function ReactiveBackground() {
  const { scene } = useThree();
  const baseColor = useMemo(() => new THREE.Color("#050510"), []);

  useFrame(() => {
    // Pulse intensity ranges based on BPM frequencies
    const pulseIntensity = GlobalAudioState.dominantFrequency / 255;
    
    // Lerp background towards the dominating track's color scaled by proximity and pulse
    const influence = Math.max(0, 1 - GlobalAudioState.closestDistance / 60);
    const targetColor = baseColor.clone().lerp(GlobalAudioState.dominantColor, influence * pulseIntensity * 0.8);
    
    // Apply dynamic colored fog
    if (!scene.fog) {
        scene.fog = new THREE.FogExp2(baseColor, 0.001);
    }
    
    // Smoothly apply WebGL background color changes every frame
    if (scene.background instanceof THREE.Color) {
        scene.background.lerp(targetColor, 0.1);
    } else {
        scene.background = targetColor.clone();
    }
    if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(targetColor, 0.1);
    }
    
// Reset closest distance each frame so planets compete continually
    GlobalAudioState.closestDistance = Infinity;
  });

  return null;
}

export interface PlanetData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
  size: number;
  audioUrl?: string;
  artworkUrl?: string;
  genre?: string;
  textureType?: "ocean" | "caramel" | "crystal" | "rock";
  geometryType?: "sphere" | "icosahedron" | "torus" | "dodecahedron" | "octahedron";
  rotationSpeed?: number;
  roughness?: number;
  metalness?: number;
  wireframe?: boolean;
  searchQuery?: string;
}

interface UniverseProps {
  planets: PlanetData[];
}

function Planet({ data }: { data: PlanetData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const audioRef = useRef<any>(null);
  const analyserRef = useRef<THREE.AudioAnalyser | null>(null);
  const [hovered, setHovered] = useState(false);

  // Load the mathematically seamless textures from the public folder
  const textureStr = data.textureType ?? "ocean";
  const texture = useTexture(`/synapse/textures/${textureStr}.png`);
  // Ensure the texture wraps organically globally over the primitive shapes
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // Unique rotation and reactive audio animation per planet
  useFrame(({ camera }) => {
    const baseSpeed = data.rotationSpeed ?? 0.001;
    if (meshRef.current) {
      meshRef.current.rotation.y += hovered ? (baseSpeed * 5) : baseSpeed;
      meshRef.current.rotation.x += baseSpeed * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += baseSpeed * 0.8;
    }
    
    // Web Audio Analyzer Physics
    if (audioRef.current && audioRef.current.getVolume) {
      // Connect visual analyzer if not initialized
      if (!analyserRef.current) {
         try {
           analyserRef.current = new THREE.AudioAnalyser(audioRef.current, 64);
         } catch (e) { /* ignore until audio context is unlocked */ }
      }

      let freq = 0;
      if (analyserRef.current) {
         freq = analyserRef.current.getAverageFrequency();
         // Make the planet physically throb based on its own track BPM!
         const pulseScale = 1 + (freq / 255) * 0.35;
         if (meshRef.current) {
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, pulseScale, 0.3));
         }
      }

      // Check spatial dominance to tint the entire universe background
      if (meshRef.current) {
          const dist = camera.position.distanceTo(meshRef.current.position);
          if (dist < GlobalAudioState.closestDistance) {
              GlobalAudioState.closestDistance = dist;
              GlobalAudioState.dominantFrequency = freq;
              GlobalAudioState.dominantColor.set(data.color);
          }
      }

      const targetVolume = 1.0; 
      const currentVol = audioRef.current.getVolume();
      audioRef.current.setVolume(THREE.MathUtils.lerp(currentVol, targetVolume, 0.05));
    }
  });

  const renderGeometry = () => {
    switch (data.geometryType) {
      case "icosahedron": return <icosahedronGeometry args={[data.size, 1]} />;
      case "torus": return <torusGeometry args={[data.size * 0.8, data.size * 0.3, 16, 64]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[data.size, 0]} />;
      case "octahedron": return <octahedronGeometry args={[data.size, 0]} />;
      case "sphere":
      default: return <sphereGeometry args={[data.size, 64, 64]} />;
    }
  };

  return (
    <group position={data.position}>
      {data.audioUrl && (
        <PositionalAudio
          ref={audioRef}
          url={data.audioUrl}
          distanceModel="exponential"
          distance={5}
          rolloffFactor={4}
          loop
          autoplay
        />
      )}
      
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
      >
        {renderGeometry()}
        <meshStandardMaterial
          map={texture}
          color={hovered ? "#ffffff" : data.color}
          roughness={data.roughness ?? 0.4}
          metalness={data.metalness ?? 0.1}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          wireframe={data.wireframe}
        />
      </mesh>

      {/* Decorative Ring */}
      {data.geometryType !== "torus" && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[data.size * 1.6, data.size * 1.7, 64]} />
          <meshBasicMaterial
            color={data.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
            wireframe={data.wireframe}
          />
        </mesh>
      )}

      {/* Render Album Billboard dynamically facing the camera at all times */}
      <Billboard
        position={[0, data.size + 1.8, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <group>
          {data.artworkUrl && (
            <Suspense fallback={null}>
              <Image 
                url={data.artworkUrl} 
                position={[-2, 0, 0]} 
                scale={[2.5, 2.5]} 
                transparent
              />
            </Suspense>
          )}
          <Text
            position={[data.artworkUrl ? -0.4 : 0, 0.4, 0]}
            fontSize={0.7}
            color="white"
            anchorX={data.artworkUrl ? "left" : "center"}
            anchorY="middle"
          >
            {data.name}
          </Text>
          <Text
            position={[data.artworkUrl ? -0.4 : 0, -0.4, 0]}
            fontSize={0.35}
            color="#cccccc"
            anchorX={data.artworkUrl ? "left" : "center"}
            anchorY="middle"
          >
            {data.description}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

// Extremely fluid custom free-fly controller
function FlyController() {
  const { camera, gl } = useThree();
  // We use useMemo to cache the euler to avoid instantiating it per frame or render
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const state = useRef({ isDragging: false });

  useEffect(() => {
    const canvas = gl.domElement;
    
    const onPointerDown = (e: PointerEvent) => {
      // Don't hijack if they are clicking a UI element or similar
      if (e.button === 0 || e.button === 2) {
        state.current.isDragging = true;
        canvas.style.cursor = "grabbing";
      }
    };
    
    const onPointerUp = () => {
      state.current.isDragging = false;
      canvas.style.cursor = "grab";
    };
    
    const onPointerMove = (e: PointerEvent) => {
      if (state.current.isDragging) {
        euler.current.setFromQuaternion(camera.quaternion);
        euler.current.y -= e.movementX * 0.005;
        euler.current.x -= e.movementY * 0.005;
        // Clamp vertical look to prevent camera flipping upside down
        euler.current.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Calculate Normalized Device Coordinates (NDC) from cursor position
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Cast a vector from the camera out into the 3D world matching the cursor's focal point
      const mouseDirection = new THREE.Vector3(x, y, 0.5);
      mouseDirection.unproject(camera);
      mouseDirection.sub(camera.position).normalize();

      // DeltaY is usually (-100) for forward/zoom-in, (+100) for backward/zoom-out.
      const distance = e.deltaY * 0.08;
      
      // Move camera strictly along the cursor's focal vector!
      camera.position.addScaledVector(mouseDirection, -distance);
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [camera, gl]);

  return null;
}

// Emulates a true infinitely-distant night sky by locking translation (but not rotation) to the camera
function InfiniteStars() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ camera }) => {
    if (groupRef.current) {
      // Pin the star sphere to the camera so the user can never fly out of bounds
      groupRef.current.position.copy(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <Stars
        radius={200}
        depth={100}
        count={20000} // Heavily increased star density
        factor={7}
        saturation={0}
        fade
        speed={1.5}
      />
    </group>
  );
}

export function Universe({ planets }: UniverseProps) {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#050510] z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 5, 45], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <ReactiveBackground />
        
        <InfiniteStars />

        <Suspense fallback={null}>
          {planets.map((p) => (
            <Planet 
              key={p.id} 
              data={p} 
            />
          ))}
        </Suspense>

        <FlyController />
      </Canvas>
    </div>
  );
}
