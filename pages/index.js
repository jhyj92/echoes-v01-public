import Head from 'next/head';

export default function Home() {
  return (
    <div style={{
      backgroundColor: '#121212',
      color: '#ffffff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>Echoes v0.1</title>
      </Head>
      <h1>Welcome to Echoes v0.1</h1>
      <p>Your self-discovery journey begins here.</p>
    </div>
  );
}
