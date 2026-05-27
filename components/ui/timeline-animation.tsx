"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode, RefObject } from "react";
import { motion, useInView, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type TimelineContentProps<T extends ElementType> = {
  as?: T;
  animationNum?: number;
  timelineRef: RefObject<Element | null>;
  customVariants?: Variants;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function TimelineContent<T extends ElementType = "div">({
  as,
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps<T>) {
  const isInView = useInView(timelineRef, { once: true, margin: "-120px" });
  const MotionTag = motion.create(as || "div");

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
