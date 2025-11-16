import { cn } from "@/lib/utils";

interface TagProps {
  name: string;
  count?: number;
  onClick?: () => void;
  isSelected?: boolean;
  animationDelay?: string;
  className?: string;
}

export function Tag({
  name,
  count,
  onClick,
  isSelected = false,
  animationDelay,
  className,
}: TagProps) {
  const baseClasses = "px-2 py-1 text-sm font-mono rounded-sm";

  const interactiveClasses = onClick
    ? `hover:scale-105 cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
      }`
    : "bg-primary/10 text-primary border border-primary/20";

  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={cn(baseClasses, interactiveClasses, className)}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {name}
      {count !== undefined && (
        <>
          {" "}
          <span className="opacity-70">({count})</span>
        </>
      )}
    </Component>
  );
}
