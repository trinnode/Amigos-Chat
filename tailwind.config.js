/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom colors for the app - black, green, white theme
      colors: {
        "amigo-black": "#000000",
        "amigo-green": "#00ff00",
        "amigo-green-dark": "#00cc00",
        "amigo-green-light": "#80ff80",
        "amigo-white": "#ffffff",
        "amigo-gray": "#333333",
        "amigo-gray-light": "#666666",
      },
      // Fira Code and monospace fonts
      fontFamily: {
        mono: [
          "Fira Code",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        fira: ["Fira Code", "monospace"],
      },
      // Custom animations for gamified experience
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-green": "pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        matrix: "matrix 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-green": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00",
          },
          "100%": {
            boxShadow: "0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00",
          },
        },
        matrix: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};
