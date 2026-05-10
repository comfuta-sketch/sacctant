import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  inputClassName?: string;
};

export const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
  ({ className, inputClassName, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className={cn("relative", className)}>
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-10 text-sm text-navy-deep placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15",
            inputClassName,
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-graphite hover:text-navy"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
