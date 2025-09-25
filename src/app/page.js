"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ───────────────────────── Hover preview (video / YouTube) ─────────────────────────
   Uses useMemo safely: hooks run first; conditional render after hooks. */
function HoverPreview({ row, position, isMuted }) {
  // Constants
  const PREVIEW_W = 320;
  const PREVIEW_H = 180;
  const OFFSET = 20;

  // Compute clamped position based on cursor (doesn't depend on `row`)
  const { left, top } = useMemo(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
    const rawLeft = (position?.x ?? 0) + OFFSET;
    const rawTop  = (position?.y ?? 0) + OFFSET;
    return {
      left: Math.min(rawLeft, vw - PREVIEW_W - 8),
      top:  Math.min(rawTop,  vh - PREVIEW_H - 8),
    };
  }, [position?.x, position?.y]);

  // Derive media src (safe even if row is null/undefined)
  const src = row?.videoMp4 || row?.video;
  const isYouTube = src && !row?.videoMp4 && src.includes("youtube");

  // Conditional render happens AFTER hooks have executed
  if (!row) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute rounded-md overflow-hidden shadow-xl pointer-events-none"
      style={{ top, left, width: PREVIEW_W, height: PREVIEW_H, zIndex: 50 }}
    >
      {src &&
        (row.videoMp4 ? (
          <video
            className="w-full h-full object-cover"
            src={row.videoMp4}
            playsInline
            autoPlay
            loop
            preload="auto"
            muted={isMuted}
          />
        ) : isYouTube ? (
          <iframe
            key={isMuted ? "yt-muted" : "yt-unmuted"}
            className="w-full h-full"
            src={
              src.replace("watch?v=", "embed/") +
              "?autoplay=1&loop=1&playlist=" +
              (src.split("v=")[1] || "") +
              "&controls=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&disablekb=1&playsinline=1" +
              (isMuted ? "&mute=1" : "&mute=0")
            }
            title={row.title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        ) : null)}
    </motion.div>
  );
}

/* ─────────────────────────────────── Page ─────────────────────────────────── */
export default function ReadingMachines() {
  const reduce = useReducedMotion();

  // Hover / preview state
  const [hoverRow, setHoverRow] = useState(null);
  const [previewRow, setPreviewRow] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Audio toggle for previews
  const [isMuted, setIsMuted] = useState(true);

  // Drag guard so click vs drag is reliable
  const [isDragging, setIsDragging] = useState(false);

  // Which row is expanded
  const [expandedRow, setExpandedRow] = useState(null);

  // Static dataset (local, no external APIs)
  const data = [
    { no: "KK–33", title: "King Kong (1933)", dialogue: "It was beauty killed the beast.", author: "Merian C. Cooper & Ernest B. Schoedsack", video: "https://www.youtube.com/watch?v=MMNICLfHE3M" },
    { no: "KK–76", title: "King Kong (1976)", dialogue: "The legend reborn.", author: "John Guillermin", video: "https://www.youtube.com/watch?v=dO_RnY_IBww" },
    { no: "KK–05", title: "King Kong (2005)", dialogue: "No one can stop this giant.", author: "Peter Jackson", video: "https://www.youtube.com/watch?v=AYaTCPbYGdk" },
    { no: "KK–17", title: "Kong: Skull Island (2017)", dialogue: "Is that a monkey?", author: "Jordan Vogt-Roberts", video: "https://www.youtube.com/watch?v=44LdLqgOpjo" },
    { no: "GZ–54", title: "Godzilla (1954)", dialogue: "The original King of the Monsters.", author: "Ishirō Honda", video: "https://www.youtube.com/watch?v=EjNYWCH-fJw" },
    { no: "GZ–98", title: "Godzilla (1998)", dialogue: "Size does matter.", author: "Roland Emmerich", video: "https://www.youtube.com/watch?v=YAbI4w95cTE" },
    { no: "GZ–14", title: "Godzilla (2014)", dialogue: "Let them fight.", author: "Gareth Edwards", video: "https://www.youtube.com/watch?v=vIu85WQTPRc" },
    { no: "GZ–19", title: "Godzilla: King of the Monsters (2019)", dialogue: "Long live the king.", author: "Michael Dougherty", video: "https://www.youtube.com/watch?v=wVDtmouV9kM" },
    { no: "GZ–21", title: "Godzilla vs. Kong (2021)", dialogue: "One will fall.", author: "Adam Wingard", video: "https://www.youtube.com/watch?v=odM92ap8_c0" },
    { no: "GZ–24", title: "Godzilla x Kong: The New Empire (2024)", dialogue: "Together they stand.", author: "Adam Wingard", video: "https://www.youtube.com/watch?v=qqrpMRDuPfc" },
  ];

  // End dragging on mouseup so click-expand works
  useEffect(() => {
    const stopDrag = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#5a95ff] text-white font-sans relative overflow-hidden">
      {/* Header */}
      <div className="w-full py-6 px-6 flex justify-between items-start">
        <div>
          <h1 className="text-6xl font-extrabold">concept for scroll row</h1>
        </div>

        <button
          onClick={() => setIsMuted((m) => !m)}
          className="text-sm uppercase tracking-wider bg-white text-[#1C2541] px-3 py-1 rounded"
          aria-pressed={!isMuted}
        >
          {isMuted ? "SOUND ON" : "SOUND OFF"}
        </button>
      </div>

      {/* Rows */}
      <div className="w-full select-none" role="list" aria-label="Film list">
        {data.map((row, i) => {
          const isHovered = hoverRow === i;
          const isExpanded = expandedRow === i;

          // Keep dimensions predictable to avoid layout jumps
          const showOverlay = isHovered && !isExpanded;
          const rowHeight = isExpanded ? 72 : isHovered ? 112 : 56; // px

          return (
            <div
              key={i}
              role="listitem"
              className="relative group"
              onMouseEnter={() => {
                setHoverRow(i);
                setPreviewRow(row);
              }}
              onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => {
                setHoverRow(null);
                setPreviewRow(null); // clear preview when leaving
              }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setHoverRow(i)} // touch = "hover"
              onTouchEnd={() => setHoverRow(null)}
              onClick={() => {
                if (!isDragging) {
                  setExpandedRow(isExpanded ? null : i);
                  setPreviewRow(null); // don't show floating preview over expanded panel
                }
              }}
            >
              {/* Row wrapper that grows on hover; stable when expanded */}
              <motion.div
                initial={false}
                animate={{ height: rowHeight }}
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22 }
                }
                className="overflow-hidden border-b border-white/50"
              >
                {/* Compact layer (always visible; hover overlay fades over it) */}
                <div
                  className={`grid grid-cols-[12rem,1fr,4rem,24rem] items-start transition-opacity duration-150 ${
                    showOverlay ? "group-hover:opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="px-2 py-2">
                    <span className="text-[11px]">{row.no}</span>
                  </div>

                  <div className="px-2 py-2">
                    <a
                      href={row.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] underline decoration-transparent hover:decoration-current focus:decoration-current outline-none focus:ring-2 focus:ring-white/70 rounded-sm"
                    >
                      {row.title}
                    </a>
                    {row.dialogue && (
                      <div className="italic text-[10px] opacity-80">“{row.dialogue}”</div>
                    )}
                  </div>

                  <div className="px-2 py-2 italic text-[12px]">by</div>

                  <div className="px-2 py-2">
                    <span className="text-[12px]">{row.author}</span>
                  </div>
                </div>

                {/* Hover overlay: large typography, only when hovered & NOT expanded */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showOverlay ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.15 }}
                  className="pointer-events-none absolute inset-0 flex items-center px-2"
                >
                  {/* Left: No. */}
                  <div className="shrink-0 w-[12rem] pr-2">
                    <div className="text-4xl font-semibold">{row.no}</div>
                  </div>

                  {/* Middle: Title + optional dialogue */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4">
                      <a
                        href={row.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-5xl font-bold leading-none underline decoration-transparent hover:decoration-current outline-none focus:ring-2 focus:ring-white/70 rounded-sm ${
                          showOverlay ? "pointer-events-auto" : "pointer-events-none"
                        }`}
                      >
                        {row.title}
                      </a>
                      <div className="italic text-xl opacity-90 hidden md:block">by</div>
                    </div>
                    {row.dialogue && (
                      <div className="italic text-sm opacity-90 mt-1">“{row.dialogue}”</div>
                    )}
                  </div>

                  {/* Right: Author */}
                  <div className="shrink-0 w-[24rem] pl-2 text-right">
                    <div className="text-3xl font-semibold leading-none">{row.author}</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Expanded details panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reduce ? 0 : 0.3 }}
                    className="relative z-[1] bg-[#1C2541]"
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="text-white/90">
                        <div className="font-semibold">{row.title}</div>
                        <div className="text-sm opacity-90">{row.author}</div>
                        {row.dialogue && (
                          <div className="italic text-sm opacity-80 mt-1">“{row.dialogue}”</div>
                        )}
                        <a
                          href={row.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block mt-3 underline underline-offset-2 hover:no-underline"
                        >
                          Watch on YouTube ↗
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Hover video preview (only shows for hovered, non-expanded rows) */}
      <AnimatePresence>
        {previewRow && (
          <HoverPreview row={previewRow} position={cursorPos} isMuted={isMuted} />
        )}
      </AnimatePresence>
    </div>
  );
}
