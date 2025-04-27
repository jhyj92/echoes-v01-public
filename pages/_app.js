// pages/_app.js
import "../style.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}