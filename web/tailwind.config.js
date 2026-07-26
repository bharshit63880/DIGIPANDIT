/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Devanagari"', '"Plus Jakarta Sans"', "sans-serif"],
        serif: ['"Noto Serif Devanagari"', '"Cormorant Garamond"', "Georgia", "serif"],
      },
      colors: {
        brand: {
          cream: "#fff4df",
          sand: "#e6c99a",
          clay: "#a54b1b",
          maroon: "#7b2d0d",
          forest: "#6c4a1d",
          ink: "#391607",
          gold: "#e7bc63",
          blush: "#f4ddaf",
          mist: "#fbecd1",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(93, 37, 10, 0.13), 0 3px 12px rgba(57, 22, 7, 0.06)",
        lift: "0 30px 80px rgba(93, 37, 10, 0.23), 0 10px 26px rgba(165, 75, 27, 0.15)",
      },
      backgroundImage: {
        "hero-pattern":
          "radial-gradient(circle at 84% 10%, rgba(231, 188, 99, 0.30), transparent 28%), radial-gradient(circle at 12% 88%, rgba(123, 45, 13, 0.15), transparent 34%), linear-gradient(135deg, #fff4df 0%, #f8dfb5 53%, #f7e5c7 100%)",
      },
    },
  },
  plugins: [],
};
