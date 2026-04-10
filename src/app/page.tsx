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
      // Fetch actual songs from iTunes Search API (CORS friendly, no auth required)
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setError("NO AUDIO SIGNATURES DETECTED IN THIS SECTOR.");
        setIsLoading(false);
        return;
      }

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

      const newPlanets = [];

      for (let i = 0; i < data.results.length; i++) {
        const track = data.results[i];
        
        // Characteristic 1: Parse Genre
        const genre = track.primaryGenreName || "Unknown";
        
        // Characteristic 2: Derive unique properties from track info
        const trackHash = track.trackId || (Date.now() + i);
        const durationMod = track.trackTimeMillis ? (track.trackTimeMillis % 100) / 100 : 0.5;
        
        const size = 1.2 + (trackHash % 50) / 20; 
        
        // Define Color by Genre (Fallback to hash)
        let hue;
        if (genre.includes("Pop")) hue = 320; // Pink
        else if (genre.includes("Rock") || genre.includes("Metal")) hue = 0; // Red
        else if (genre.includes("Electronic") || genre.includes("Dance")) hue = 180; // Cyan
        else if (genre.includes("Hip-Hop") || genre.includes("Rap")) hue = 270; // Purple
        else if (genre.includes("Country") || genre.includes("Folk")) hue = 30; // Orange
        else if (genre.includes("Classical") || genre.includes("Jazz")) hue = 210; // Blue
        else hue = Math.abs((hash + (i * 75)) % 360);
        
        // Add variations to hue
        const finalHue = (hue + (trackHash % 40) - 20 + 360) % 360;

        // Visual Textures & Geometry strongly driven by GENRE
        let geometryType: "sphere" | "icosahedron" | "torus" | "dodecahedron" | "octahedron" = "sphere";
        let textureType: "ocean" | "caramel" | "crystal" | "rock" = "ocean";
        let roughness = 0.4;
        let metalness = 0.1;
        let wireframe = false;

        if (genre.includes("Electronic") || genre.includes("Dance")) {
          geometryType = trackHash % 2 === 0 ? "torus" : "octahedron";
          roughness = 0.1;
          metalness = 0.9; // Highly reflective
          wireframe = (trackHash % 3 === 0); // High chance of wireframe
          textureType = "crystal";
        } else if (genre.includes("Rock") || genre.includes("Metal")) {
          geometryType = trackHash % 2 === 0 ? "icosahedron" : "dodecahedron";
          roughness = 0.8; // Very rough
          metalness = 0.3;
          textureType = "rock";
        } else if (genre.includes("Hip-Hop") || genre.includes("Rap")) {
          geometryType = "dodecahedron";
          roughness = 0.3;
          metalness = 0.6;
          textureType = "rock";
        } else if (genre.includes("Classical") || genre.includes("Jazz")) {
          geometryType = "sphere";
          roughness = 0.05; // Extremely smooth glass
          metalness = 0.8;
          textureType = "ocean";
        } else if (genre.includes("Pop")) {
          geometryType = "sphere"; // Spheres look amazing with caramel
          roughness = 0.5;
          metalness = 0.4;
          textureType = "caramel";
        }

        // Movement
        const rotationSpeed = 0.001 + (durationMod * 0.015);

        // STRICTION COLLISION AVOIDANCE: Force massive separation algebraically
        // We use a strictly stepped wide-angle distribution with massive radius
        const minRadius = 120 + (trackHash % 40); // Base radius of 120 units out
        const angle = (i / data.results.length) * Math.PI * 2; // Split the circle perfectly
        
        const offsetX = Math.cos(angle) * minRadius;
        const offsetZ = Math.sin(angle) * minRadius;
        
        // Alternate them heavily up and down so they are not in a flat line
        const offsetY = (i % 2 === 0 ? 60 : -60) + ((trackHash % 20) - 10);

        newPlanets.push({
          id: `planet-${trackHash}-${i}`,
          name: track.trackName.length > 20 ? track.trackName.substring(0, 20) + "..." : track.trackName,
          description: `${genre} • By ${track.artistName}`,
          position: [clusterX + offsetX, clusterY + offsetY, clusterZ + offsetZ],
          color: `hsl(${finalHue}, 85%, 65%)`,
          size,
          audioUrl: track.previewUrl,
          artworkUrl: track.artworkUrl100,
          genre,
          geometryType,
          textureType,
          rotationSpeed,
          roughness,
          metalness,
          wireframe
        });
      }

      setPlanets((prev) => [...prev, ...(newPlanets as PlanetData[])]);

    } catch (err) {
      console.error(err);
      setError("Calculation anomaly detected.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center w-full h-full bg-black overflow-hidden font-mono antialiased">
      
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
