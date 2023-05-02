import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Header from '../components/Header';

interface Card {
  suit: string;
  value: string;
}

const HighOrLow: React.FC = () => {
  const { t } = useTranslation('high-or-low');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [message, setMessage] = useState<string>(t('welcomeMessage').toString());

  const suits: string[] = ['HEART', 'DIAMOND', 'CLUB', 'SPADE'];
  const values: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '1'];

  const drawCard = (): Card => {
    const suit: string = suits[Math.floor(Math.random() * suits.length)];
    const value: string = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
  };

  const compareCards = (card1: Card, card2: Card): number => {
    if (values.indexOf(card1.value) < values.indexOf(card2.value)) {
      return -1;
    } else if (values.indexOf(card1.value) > values.indexOf(card2.value)) {
      return 1;
    }
    return 0;
  };

  const displayCard = (card: Card): string => {
    return `/images/${card.suit}-${card.value}.svg`;
  };

  const play = (guess: string): void => {
    if (!currentCard) {
      setCurrentCard(drawCard());
      setMessage(t('guessNextCard').toString());
      return;
    }

    const nextCard: Card = drawCard();

    const comparison: number = compareCards(currentCard, nextCard);
    if (comparison === 0) {
      setMessage(t('cardsEqual').toString());
    } else if ((comparison === -1 && guess === 'higher') || (comparison === 1 && guess === 'lower')) {
      setMessage(t('correctGuess').toString());
    } else {
      setMessage(t('incorrectGuess').toString());
    }
    setCurrentCard(nextCard);
  };

  useEffect(() => {
    play('');
  }, []);


  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description').toString()} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <Header />
        <main className="main-content">
          <h2 className="game-title">{t('title').toString()}</h2>
          <div className="message-container">
            <div id="message">{message}</div>
          </div>
          <div className="game-container">
            <div className="card-display">
              {currentCard && (
                <img
                  id="current-card"
                  className="card_image"
                  src={displayCard(currentCard)}
                  alt={`${currentCard.value} of ${currentCard.suit}`}
                />
              )}
            </div>
            <div className="input-container">
              <div className="buttons">
                <button id="higher-btn" onClick={() => play('higher')}>
                  {t('higher')}
                </button>
                <button id="lower-btn" onClick={() => play('lower')}>
                  {t('lower')}
                </button>
              </div>
            </div>
          </div>
          <div id="rules-container" className="rules-container">
            <div>
              <h2 className="rule-title">{t('rulesTitle')}</h2>
              <div className="rule-item">
                <strong>{t('objective')}:</strong> {t('objectiveText')}
              </div>
              <div className="rule-item">
                <strong>{t('howToPlay')}:</strong>
                <ol>
                  <li>{t('rule1')}</li>
                  <li>{t('rule2')}</li>
                  <li>{t('rule3')}</li>
                  <li>{t('rule4')}</li>
                </ol>
              </div>
              <div className="rule-item">
                <strong>{t('cardRankings')}:</strong> {t('cardRankingsText')}
              </div>
              <div className="rule-item">
                <strong>{t('note')}:</strong> {t('noteText')}
              </div>
            </div >
          </div >
        </main >
      </div >
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['high-or-low'])),
    },
  };
};

export default HighOrLow;
