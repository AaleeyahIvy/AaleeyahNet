"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";
import anime from "animejs/lib/anime.es.js";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaLabel?: string;
};

/**
 * Card with the standard black-border look plus a rainbow shimmer that
 * sweeps across the card roughly every 20 seconds (staggered per card so
 * the page feels alive instead of synchronized).
 */
export default function ShimmerCard({
  children,
  className = "",
  style,
  onClick,
  role,
  tabIndex,
  onKeyDown,
  ariaLabel,
}: Props) {
  const shimmerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!shimmerRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let timeout: ReturnType<typeof setTimeout>;
    let anim: anime.AnimeInstance | null = null;

    const sweep = () => {
      anim = anime({
        targets: shimmerRef.current,
        translateX: ["-260%", "760%"],
        duration: 1600,
        easing: "easeInOutQuad",
        complete: () => {
          timeout = setTimeout(sweep, 20000);
        },
      });
    };

    // Random initial offset (0–20s) so cards don't all flash at once
    timeout = setTimeout(sweep, Math.random() * 20000);

    return () => {
      clearTimeout(timeout);
      anim?.pause();
    };
  }, []);

  return (
    <div
      className={`card ${className}`}
      style={style}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
    >
      <span className="shimmer" ref={shimmerRef} aria-hidden="true" />
      {children}
    </div>
  );
}
