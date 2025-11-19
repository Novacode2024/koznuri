/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  theme: {
    extend: {
      fontFamily: {
        muller: ["Muller Next Wide Trial", "Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontWeight: {
        "muller-bold": "750",
      },
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
