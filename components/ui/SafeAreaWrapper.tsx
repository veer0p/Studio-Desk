"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

/**
 * A wrapper component that handles safe area insets for mobile devices (notches, home indicators).
 * High-end mobile experience requires respecting these boundaries.
 */
export function SafeAreaWrapper({
  children,
  className,
  top = true,
  bottom = true,
  left = false,
  right = false,
}: SafeAreaWrapperProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full",
        top && "pt-[env(safe-area-inset-top)]",
        bottom && "pb-[env(safe-area-inset-bottom)]",
        left && "pl-[env(safe-area-inset-left)]",
        right && "pr-[env(safe-area-inset-right)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SafeAreaPadding({
  className,
  position = "bottom",
}: {
  className?: string;
  position?: "top" | "bottom";
}) {
  return (
    <div
      className={cn(
        position === "top" ? "h-[env(safe-area-inset-top)]" : "h-[env(safe-area-inset-bottom)]",
        className
      )}
    />
  );
}
