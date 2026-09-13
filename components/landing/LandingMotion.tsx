"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

const PointerCtx = createContext({ x: 0.5, y: 0.5 });

export function useLandingPointer() {
  return useContext(PointerCtx);
}

export function LandingShell({ children }: { children: ReactNode }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  return (
    <PointerCtx.Provider value={pos}>
      <div
        className="relative min-h-dvh overflow-x-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({
            x: (e.clientX - r.left) / Math.max(r.width, 1),
            y: (e.clientY - r.top) / Math.max(r.height, 1),
          });
        }}
      >
        {children}
      </div>
    </PointerCtx.Provider>
  );
}

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, s: 1 });

  const track = (e: PointerEvent<HTMLDivElement>, pressed: boolean) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({
      rx: py * -16,
      ry: px * 18,
      s: pressed ? 0.96 : 1.04,
    });
  };

  return (
    <div
      ref={ref}
      className={`land-tilt touch-manipulation will-change-transform ${className}`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.s})`,
      }}
      onPointerEnter={(e) => track(e, false)}
      onPointerMove={(e) => track(e, e.buttons === 1 || e.pointerType === "touch")}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        track(e, true);
      }}
      onPointerUp={() => setTilt({ rx: 0, ry: 0, s: 1 })}
      onPointerCancel={() => setTilt({ rx: 0, ry: 0, s: 1 })}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0, s: 1 })}
    >
      {children}
    </div>
  );
}
