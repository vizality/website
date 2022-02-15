// import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';

import { Navbar } from '@layout';

import '@styles/main.scss';

export default function App ({ Component, pageProps }) {
  // const { pathname } = useRouter();
  useEffect(() => {
    document.documentElement.setAttribute('vz-mode', 'dark');
  }, []);

  return (
    <>
      <Head>
        <title>Vizality - Make Your Vision a Reality | Coming Soon</title>
        <link rel='icon' href='/favicon.ico' />
        <meta name='description' content='A Discord app client modification, allowing for a truly customizable experience through the use of plugins, themes, and built-in settings.' />
        <meta name='theme-color' content='#ff006a' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        <meta property='og:type' content='website' />
        <meta property='og:title' content='Vizality | Coming Soon' />
        <meta property='og:url' content='https://vizality.com' />
        <meta property='og:site_name' content='Vizality' />
        <meta property='og:description' content='A Discord app client modification, allowing for a truly customizable experience through the use of plugins, themes, and built-in settings.' />
        <meta property='og:image' content='https://vizality.com/images/vizality-web.png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />

        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:site' content='@vizality' />
        <meta property='twitter:title' content='Vizality' />
        <meta property='twitter:description' content='A Discord app client modification, allowing for a truly customizable experience through the use of plugins, themes, and built-in settings.' />
        <meta property='twitter:image:src' content='https://vizality.com/images/vizality-web.png' />
        <meta property='twitter:image:width' content='1200' />
        <meta property='twitter:image:height' content='630' />

        <script type='text/javascript' src='/js/rpc.js'></script>
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
