import Image from "next/image";

import { cn } from "@/lib/utils";

/** Solde wordmark: the logo.svg "S" mark followed by "olde". */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline-last gap-0.5", className)}>
      <Image src="/logo.svg" alt="Solde" width={33} height={28} className="h-6 w-auto dark:invert" unoptimized priority />
      <span className="text-[29px] leading-none font-bold tracking-normal uppercase">olde</span>
    </div>
  );
}
