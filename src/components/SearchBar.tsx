"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery("");
    }
  };

  // The Search Bar is now positioned at the top of the interface
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto"
    >
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center transition-all duration-500 overflow-hidden rounded-full border border-white/20 bg-black/40 backdrop-blur-md ${
          isFocused ? "shadow-[0_0_30px_rgba(255,255,255,0.15)] border-white/40" : ""
        }`}
      >
        <div className="pl-6 text-emerald-400/80">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (query.trim() && !isLoading) {
                onSearch(query.trim());
                setQuery("");
              }
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="SEARCH SPOTIFY (e.g. Daft Punk)"
          className="w-full bg-transparent px-6 py-5 text-sm outline-none text-white placeholder:text-white/30 tracking-widest uppercase font-mono"
          disabled={isLoading}
        />
        
        {/* Subtle glowing effect around the input when not focused */}
        {!isFocused && query.length === 0 && (
          <motion.div
            className="absolute inset-0 rounded-full border border-emerald-500/10 pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </form>
    </motion.div>
  );
}
