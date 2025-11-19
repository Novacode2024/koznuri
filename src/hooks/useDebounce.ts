import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }

    const newTimer = window.setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  }) as T;

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}
