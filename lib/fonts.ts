import localFont from "next/font/local"

export const fontSans = localFont({
  src: "../public/fonts/inter-variable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
})

export const fontMono = localFont({
  src: "../public/fonts/jetbrains-mono-variable.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 900",
})
