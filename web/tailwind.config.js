/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#f8f1e8",
          sand: "#e8dac9",
          clay: "#d87c4a",
          maroon: "#7a2e1d",
          forest: "#1b4d45",
          ink: "#202126",
          gold: "#d7a739",
        },
      },
      boxShadow: {
        soft: "0 20px 60px rgba(32, 33, 38, 0.08)",
      },
      backgroundImage: {
        "hero-pattern":
          "radial-gradient(circle at top left, rgba(215, 167, 57, 0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(27, 77, 69, 0.18), transparent 28%), linear-gradient(135deg, #f8f1e8 0%, #fff9f3 100%)",
      },
    },
  },
  plugins: [],
};
