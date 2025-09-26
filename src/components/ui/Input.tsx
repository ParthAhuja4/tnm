import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", error, helperText, startAdornment, endAdornment, ...props },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <div className="relative flex">
          {startAdornment ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {startAdornment}
            </span>
          ) : null}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              startAdornment && "pl-10",
              endAdornment && "pr-10",
              error && "border-destructive focus-visible:ring-destructive/40",
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment ? (
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              {endAdornment}
            </span>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs font-medium text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
