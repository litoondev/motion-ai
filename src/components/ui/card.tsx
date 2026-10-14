import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  glow?: "primary" | "cta" | "accent" | false;
}

export function Card({ className, elevated, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? "card-elevated" : "card",
        glow === "primary" && "shadow-[var(--shadow-glow-primary)]",
        glow === "cta"     && "shadow-[var(--shadow-glow-cta)]",
        glow === "accent"  && "shadow-[var(--shadow-glow-accent)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-[var(--color-border)] flex items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
