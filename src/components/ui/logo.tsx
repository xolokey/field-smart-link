import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "shield" | "text";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12", 
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function Logo({ className, size = "md", variant = "shield" }: LogoProps) {
  const sizeClass = sizeClasses[size];

  if (variant === "shield") {
    return (
      <div className={cn("flex items-center justify-center", sizeClass, className)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Shield background */}
          <path
            d="M50 10L20 20V50C20 70 35 85 50 90C65 85 80 70 80 50V20L50 10Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          <path
            d="M50 12L22 21V50C22 68 36 82 50 87C64 82 78 68 78 50V21L50 12Z"
            fill="white"
          />
          
          {/* LE letters */}
          <g transform="translate(30, 30)">
            {/* L */}
            <path d="M0 0V20H10V16H6V0H0Z" fill="currentColor" className="text-primary"/>
            {/* E */}
            <path d="M14 0V20H26V17H18V12H24V9H18V3H26V0H14Z" fill="currentColor" className="text-primary"/>
          </g>
          
          {/* Keyhole */}
          <circle cx="50" cy="65" r="2" fill="currentColor" className="text-primary"/>
          <rect x="49" y="65" width="2" height="4" fill="currentColor" className="text-primary"/>
        </svg>
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("flex flex-col items-center font-serif", className)}>
        <div className="text-2xl font-bold tracking-wider">LOKEY</div>
        <div className="text-2xl font-bold tracking-wider">&CO</div>
        <div className="text-sm font-normal tracking-widest opacity-70">HOMESTEAD</div>
      </div>
    );
  }

  // Full logo with shield and text
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo size={size} variant="shield" />
      <Logo variant="text" className="text-sm" />
    </div>
  );
}

export function LogoIcon({ className, size = "md" }: Omit<LogoProps, "variant">) {
  return <Logo variant="shield" className={className} size={size} />;
}