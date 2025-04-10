"use client";

import { useTheme } from "@/app/context/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Sun className="h-6 w-6" />
      ) : (
        <Moon className="h-6 w-6" />
      )}
    </button>
  );
};
