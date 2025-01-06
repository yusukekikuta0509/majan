/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mycustom: ["MyCustomFont", "sans-serif"], 
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(to bottom right, #000B58, #2A004E)", 
        // ↓ 背景アニメーション用のグラデーション（横方向）例
        "gradient-flow": "linear-gradient(to right, #4f46e5, #6d28d9, #c026d3, #ec4899)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // ↓ グラデーションを左右に動かす keyframes
        gradientFlow: {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.8s ease-in-out forwards",
        // ↓ 定義した keyframes を8秒周期で無限にアニメーション
        gradientFlow: "gradientFlow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};