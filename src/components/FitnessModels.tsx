import React, { Suspense } from 'react';
import { Float } from '@react-three/drei';

export function Apple(props: any) {
  return (
    <group {...props}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#4d2900" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.15, 0.02, 0.05]} />
        <meshStandardMaterial color="#22c55e" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Dumbbell(props: any) {
  return (
    <group {...props}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function WaterBottle(props: any) {
  return (
    <group {...props}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 32]} />
        <meshPhysicalMaterial color="#38bdf8" transparent={true} opacity={0.6} roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function FitnessModelsGroup() {
  return (
    <group dispose={null} scale={1.5}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Apple position={[-1.2, 0.5, 0]} rotation={[0.2, 0.5, 0]} scale={0.8} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
        <Dumbbell position={[1.2, -0.2, 0]} rotation={[Math.PI / 4, 0, Math.PI / 4]} scale={0.8} />
      </Float>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <WaterBottle position={[0, 0.2, 1]} rotation={[-0.2, 0, 0.1]} scale={0.8} />
      </Float>
    </group>
  );
}
