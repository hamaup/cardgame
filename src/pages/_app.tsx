import '../styles/style.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import Head from 'next/head';
import { useRouter } from 'next/router';

const { languages } = nextI18NextConfig;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <>
      <Head>
        {languages.map((lang) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={`${baseUrl}/${lang}${router.pathname}`}
          />
        ))}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
