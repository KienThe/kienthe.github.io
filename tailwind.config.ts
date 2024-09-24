import { type Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans]
      },
      colors: {
        primary: "#4BD8FF",
        blue: {
          300: "#87DBFF"
        }
      },
      spacing: {
        "128": "32rem"
      },
      animation: {
        "spin-slow": "spin 3s linear infinite"
      },
    }
  },
  plugins: []
} satisfies Config
