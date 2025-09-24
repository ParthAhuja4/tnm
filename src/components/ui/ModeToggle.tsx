"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./Dropdown";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  // Toggle button icon change based on current theme
  const iconClassNames = (icon: "moon" | "sun") => {
    return `h-[1.2rem] w-[1.2rem] transition-transform duration-300 ${
      icon === "sun" && theme === "dark" ? "rotate-90 scale-0" : ""
    } ${icon === "moon" && theme !== "dark" ? "rotate-0 scale-100" : ""}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:scale-105 transition-transform"
          aria-label="Toggle theme"
        >
          {/* Sun Icon */}
          <Sun className={iconClassNames("sun")} />
          {/* Moon Icon */}
          <Moon className={`absolute ${iconClassNames("moon")}`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/* Ensure menu doesn't close unexpectedly */}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
