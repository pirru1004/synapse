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
      const response = await fetch("/api/explore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to explore the universe");
      }

      const data = await response.json();
      
      // Add the new planets to our universe array
      if (data.planets && data.planets.length > 0) {
        setPlanets((prev) => [...prev, ...data.planets]);
      }
    } catch (err) {
      console.error(err);
      setError("Communication with mission control lost.");
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
            <span>PUBLIC_ACCESS_GRANTED</span>
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
            <span>v1.0.0-galaxy</span>
            <span>SERVER_CREDENTIAL_ROUTING</span>
          </div>
        </footer>
      </div>

    </main>
  );
}
