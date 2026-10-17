"use client";

import { useState, useEffect } from "react";

export function useCountdown(targetIsoDate: string) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const diff = Math.floor(
      (new Date(targetIsoDate).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor(
        (new Date(targetIsoDate).getTime() - Date.now()) / 1000
      );
      setRemainingSeconds(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIsoDate]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    remainingSeconds,
    isExpired: remainingSeconds <= 0,
    formatted: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`,
    mmss: `${String(minutes + hours * 60).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`,
  };
}
