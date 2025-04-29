import "../styles/starfield.css";
export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="starfield" />
      <Component {...pageProps} />
    </>
  );
}
