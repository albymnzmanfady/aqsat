"use client";

import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

const AnimatedCounter = ({
  value,
  suffix = "",
  prefix = "",
  duration = 600,
  className,
  formatter,
}: AnimatedCounterProps) => {
  const count = useAnimatedCounter(value, duration);

  const display = formatter ? formatter(count) : count.toLocaleString();

  return (
    <span className={cn("counter-pop inline-block", className)} key={count}>
      {prefix}{display}{suffix}
    </span>
  );
};

export default AnimatedCounter;