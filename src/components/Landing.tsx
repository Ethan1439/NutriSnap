import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, ContactShadows, OrbitControls } from '@react-three/drei';
import { getProfile } from '../lib/storage';
import { FitnessModelsGroup } from './FitnessModels';

export default function Landing() {
  const profile = getProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2723] via-[#3a352d] to-[#1e1c18] text-[#f4efe6] font-sans overflow-hidden flex flex-col relative">
      {/* Navigation */}
      <nav className="p-6 md:p-10 flex justify-between items-center z-10 relative">
        <div className="font-bold tracking-widest border border-[#f4efe6]/30 px-6 py-2 rounded-full text-xs hover:border-[#f4efe6] transition-colors cursor-default">
          GRAMGLANCE
        </div>
        <div className="text-xs uppercase tracking-widest flex gap-8 items-center">
          <span className="hidden sm:inline-block opacity-60">Fitness & Nutrition Platform</span>
          {profile ? (
            <Link to="/dashboard" className="hover:opacity-60 transition-opacity">Dashboard</Link>
          ) : (
            <Link to="/login" className="hover:opacity-60 transition-opacity">Login</Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center min-h-[600px]">
        {/* Large Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="flex w-full justify-between px-4 sm:px-16 items-center">
             <h1 className="text-[10vw] font-black tracking-tighter leading-none text-[#f4efe6] mix-blend-overlay opacity-80" style={{ fontFamily: 'Georgia, serif' }}>
                GRAM
             </h1>
             <h1 className="text-[10vw] font-black tracking-tighter leading-none text-[#f4efe6] mix-blend-overlay opacity-80" style={{ fontFamily: 'Georgia, serif' }}>
                GLANCE
             </h1>
          </div>
        </div>

        {/* Info Box */}
        <div className="absolute right-8 top-1/4 max-w-[240px] z-10 hidden lg:block text-xs leading-relaxed backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10">
           <p className="mb-4 text-[#f4efe6]/80 text-sm">
             A premium platform showcasing the powerful features of GramGlance. A collaboration with your fitness goals.
           </p>
           <p className="text-[#f4efe6]/50 mb-2 font-bold uppercase tracking-widest">Featuring:</p>
           <ul className="text-[#f4efe6]/90 space-y-1.5 font-medium">
             <li>• AI Meal Logging</li>
             <li>• 3D Visualization</li>
             <li>• Advanced Reports</li>
             <li>• Community Access</li>
           </ul>
        </div>

        {/* Call to Actions */}
        <div className="absolute bottom-1/4 right-8 lg:right-1/4 z-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link to={profile ? "/dashboard" : "/register"} className="border border-[#f4efe6] bg-[#f4efe6] text-[#1a1815] px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#f4efe6] transition-all duration-300">
              {profile ? "Go to Dashboard" : "Sign Up"}
            </Link>
            {!profile && (
              <Link to="/login" className="border border-[#f4efe6]/30 px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[#f4efe6] hover:bg-white/5 transition-all duration-300">
                Book a Call
              </Link>
            )}
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
          <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} color="#fff1e6" />
            <spotLight position={[-10, -10, -10]} angle={0.2} penumbra={1} intensity={0.5} color="#e0e7ff" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI - Math.PI / 2.5}
            />
            <Suspense fallback={null}>
              <group rotation={[0.1, 0.3, 0]}>
                <FitnessModelsGroup />
              </group>
              <Environment preset="city" />
            </Suspense>
            <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
          </Canvas>
        </div>
      </main>

      {/* Footer Text */}
      <div className="p-6 md:p-10 flex justify-between items-center z-10 relative mt-auto">
        <div className="text-[10px] tracking-widest uppercase text-[#f4efe6]/50">
          Shopify Plus × Sunny Side Up (GramGlance Demo)
        </div>
      </div>
    </div>
  );
}
