// pages/_app.js
import "@/styles/globals.css";     // Tailwind + your base styles
import "@/styles/themes.css";      // your --clr-gold, hue-shift, button resets
import "@/styles/starfield.css";   // the animate-starfield keyframes

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
