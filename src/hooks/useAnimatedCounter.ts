"use client";

import { useState, useEffect, useRef } from "react";

export const useAnimatedCounter = (
  target: number,
  duration: number = 600,
  startOnMount: boolean = true
): number => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    setCount(current);

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      setCount(target);
    }
  };

  useEffect(() => {
    if (startOnMount && !startedRef.current) {
      startedRef.current = true;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [target, duration, startOnMount]);

  // Reset if target changes
  useEffect(() => {
    startedRef.current = false;
    startTimeRef.current = null;
    setCount(0);
    const timeout = setTimeout(() => {
      startedRef.current = true;
      animFrameRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timeout);
  }, [target]);

  return count;
};