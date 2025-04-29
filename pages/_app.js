// pages/_app.js

import "../styles/starfield.css";

export default function App({ Component, pageProps }) {
  // Wrap in starfield and allow theme class on <main>
  return (
    <>
      <div className="starfield" />
      <Component {...pageProps} />
    </>
  );
}
