"use client";

import dynamic from "next/dynamic";
import React from "react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse">جاري تحميل المشغل...</div>
});

export function MuxPlayerWrapper({ playbackId }: { playbackId: string }) {
  // Handle local development URLs from Supabase
  let isUrl = false;
  let finalSource = playbackId;

  if (typeof window !== "undefined" && playbackId) {
    if (playbackId.startsWith("http")) {
      isUrl = true;
      // Dynamically replace localhost with the actual network IP for mobile testing
      if (playbackId.includes("localhost")) {
        finalSource = playbackId.replace("localhost", window.location.hostname);
        console.log("[Video Player] Replaced localhost with network IP:", finalSource);
      }
    }
  } else if (playbackId?.startsWith("http")) {
    isUrl = true; // For SSR, just mark it as URL
  }

  // Handle errors gracefully
  const handleError = (e: Event) => {
    console.error("[Video Player] Error loading video source:", e);
  };

  if (isUrl) {
    return (
      <MuxPlayer
        src={finalSource}
        style={{ '--primary-color': '#9333EA' } as any}
        className="w-full h-full object-contain bg-black"
        onError={handleError}
      />
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      style={{ '--primary-color': '#9333EA' } as any}
      className="w-full h-full object-contain bg-black"
      onError={handleError}
    />
  );
}
