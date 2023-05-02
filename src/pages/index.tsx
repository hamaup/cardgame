// src/pages/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Header from '../components/Header';
import Link from 'next/link';

const Home: NextPage = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <Header />
        <main className="main-content">
          <h2 className="text-center text-3xl font-semibold mb-8">ゲーム一覧</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/blackjack" as={`/blackjack`}>
              <span className="text-blue-500 hover:text-blue-700 cursor-pointer"> {t('game.blackjack')}
              </span>
            </Link>
            <Link href="/guess-the-card" as={`/guess-the-card`}>
              <span className="text-blue-500 hover:text-blue-700 cursor-pointer"> {t('game.guess-the-card')}
              </span>
            </Link>
            <Link href="/high-or-low" as={`/high-or-low`}>
              <span className="text-blue-500 hover:text-blue-700 cursor-pointer">{t('game.high-or-low')}
              </span>
            </Link>
            <Link href="/memory-game" as={`/memory-game`}>
              <span className="text-blue-500 hover:text-blue-700 cursor-pointer">{t('game.memory-game')}
              </span>
            </Link>
          </div>
        </main>
      </div >
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;
