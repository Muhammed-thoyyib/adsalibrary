
"use client";

import { Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideText?: boolean;
}

export function Logo({ className, iconClassName, textClassName, hideText = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105",
        iconClassName
      )}>
        <Library className="size-5" />
      </div>
      {!hideText && (
        <span className={cn(
          "font-headline text-xl font-bold text-primary tracking-tight leading-none",
          textClassName
        )}>
          ADSALIBRARY
        </span>
      )}
    </div>
  );
}
