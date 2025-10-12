import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'arena-bg': '#0f1014',
        'arena-enemy': '#d15073',
        'arena-player': '#4ea8de',
        'arena-neutral': '#f4c152',
        'arena-text': '#f3f4f6',
        'arena-subtext': '#9ca3af',
        'arena-anti-lv1': '#f97316',
        'arena-anti-lv2': '#f43f5e',
        'arena-anti-lv3': '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config
