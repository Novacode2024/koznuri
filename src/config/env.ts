// Environment configuration
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "/api" : "https://koznuri.novacode.uz/api"),
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),
  API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || "3"),
  API_KEY: import.meta.env.VITE_API_KEY || "",
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || "",
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",
} as const;

// Validate required environment variables
if (!config.API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required");
}

export default config;
