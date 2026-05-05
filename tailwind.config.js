/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#15803d",
          dark: "#14532d",
          light: "#22c55e",
          muted: "#9e9e8e"
        },
        ivory: {
          DEFAULT: "#FFFFFF", 
          alt: "#F9FAFB",
          soft: "#FFFFFF",
          warm: "#F3F4F6",
          deep: "#E5E7EB",
        },
        heading: "#1F2D1F",
        olive: "#9e9e8e",
        rust: "#AA423A",
        amber: "#C7A59D",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(30,61,36,0.04)",
        card: "0 4px 20px rgba(30,61,36,0.06)",
      },
      borderRadius: {
        site: "12px", // Làm mềm các góc từ 4px lên 12px
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px",
      },
      fontFamily: {
        sans: ["Rubik", "sans-serif"],
      },
    },
  },
  plugins: [],
}
