"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Universe, PlanetData } from "@/components/Universe";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Because we are deploying to GitHub Pages (Static HTML Export), 
      // we cannot use a Node.JS server for API logic.
      // So we generate the mathematical space completely client-side!
      
      // Hash the base query to derive cluster center
      let hash = 0;
      for (let i = 0; i < query.length; i++) {
          hash = query.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Cluster Center
      const range = 100;
      const clusterX = (Math.abs((hash * 13) % range) - range / 2);
      const clusterY = (Math.abs((hash * 17) % range) - range / 2) * 0.5; 
      const clusterZ = (Math.abs((hash * 23) % range) - range / 2) - 30;  

      // Generate 5 planets (simulating Top 5 Songs)
      const newPlanets = [];
      const songNames = ["Phantom", "Stardust", "Nebula", "Nova", "Eclipse"];

      for (let i = 0; i < 5; i++) {
        const hue = Math.abs((hash + (i * 45)) % 360);
        const size = 1.0 + (Math.abs((hash + i) % 10) / 10) * 2.5; 
        
        // Scatter them slightly around the cluster center
        const offsetX = Math.cos(i * (Math.PI * 2) / 5) * (size * 8);
        const offsetZ = Math.sin(i * (Math.PI * 2) / 5) * (size * 8);
        const offsetY = (Math.abs((hash + i * 7) % 5) - 2.5);

        newPlanets.push({
          id: `planet-${Date.now()}-${i}`,
          name: `${query.toUpperCase()} - ${songNames[i]}`,
          description: `Track ${i + 1} of ${query}`,
          position: [clusterX + offsetX, clusterY + offsetY, clusterZ + offsetZ],
          color: `hsl(${hue}, 80%, 60%)`,
          size,
        });
      }

      // Small artificial delay to show UI loading
      await new Promise(resolve => setTimeout(resolve, 600));

      setPlanets((prev) => [...prev, ...(newPlanets as PlanetData[])]);

    } catch (err) {
      console.error(err);
      setError("Calculation anomaly detected.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-black overflow-hidden font-mono antialiased">
      
      {/* 3D WebGL Background Container */}
      <Universe planets={planets} />

      {/* Floating UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 p-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-start text-white/50 w-full animate-fade-in pointer-events-auto">
          <div className="text-xl font-bold tracking-[0.2em] text-white">SYNAPSE</div>
          
          <div className="flex flex-col items-end gap-3 text-sm tracking-widest uppercase">
            {/* Minimalist instructions */}
            <div className="flex flex-col items-end bg-black/40 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm text-xs text-white/50 gap-1 text-right">
                <span className="text-emerald-400 font-bold mb-1">CONTROLS</span>
                <span>🖱️ Click + Drag to Rotate Void</span>
                <span>⚙️ Scroll to Zoom Camera</span>
                <span>🎯 Click a Planet to Travel</span>
            </div>
          </div>
        </header>

        {/* Central Search Element */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Footer / Status */}
        <footer className="flex justify-between items-end text-xs text-white/30 tracking-widest w-full pointer-events-auto">
          <div className="flex flex-col gap-1">
            <span>SYSTEM_READY</span>
            <span>STATIC_OVERRIDE_ACTIVE</span>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-red-500/80 bg-red-500/10 px-4 py-2 border border-red-500/20 rounded"
              >
                {error}
              </motion.div>
            )}
            {!error && planets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400/80 font-bold tracking-widest"
              >
                ENTITIES DETECTED: {planets.length}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-right flex flex-col gap-1">
            <span>v2.0.0-static</span>
            <span>GITHUB_PAGES_MODE</span>
          </div>
        </footer>
      </div>

    </main>
  );
}
