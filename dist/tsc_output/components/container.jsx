import { cn } from "@/lib/utils";
export function Container({ children, className, size = "lg" }) {
    return (<div className={cn("mx-auto px-4", {
            "max-w-screen-sm": size === "sm",
            "max-w-screen-md": size === "md",
            "max-w-screen-lg": size === "lg",
            "max-w-screen-xl": size === "xl",
            "max-w-none": size === "full",
        }, className)}>
      {children}
    </div>);
}
