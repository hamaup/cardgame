import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Header from '../components/Header';

type Card = {
  suit: string;
  value: string;
};

const GuessTheCard: React.FC = () => {
  const { t } = useTranslation('guess-the-card');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [guessedCard, setGuessedCard] = useState<string>('');
  const [message, setMessage] = useState<string>(t('welcomeMessage').toString());
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<string>('readyToGuess');

  const suits: string[] = ['HEART', 'DIAMOND', 'CLUB', 'SPADE'];
  const values: string[] = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'
  ];

  const drawCard = (): Card => {
    const suit: string = suits[Math.floor(Math.random() * suits.length)];
    const value: string = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
  };

  const handleGuess = (value: string) => {
    setGameStatus('guessing'); // Disable buttons while guessing

    setShowAnswer(true);
    if (value === currentCard?.value) {
      setMessage(t('correctGuess').toString());
      setGameStatus('correct');
    } else {
      setMessage(t('incorrectGuess', { value: currentCard?.value }).toString());
      setGameStatus('incorrect');
    }
    setTimeout(() => {
      setCurrentCard(drawCard());
      setShowAnswer(false);
      setGuessedCard('');
      setGameStatus('readyToGuess'); // Reset game status
    }, 2000);
  };

  useEffect(() => {
    setCurrentCard(drawCard());
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
              {/* Display the card suit and a question mark for the value */}
              {currentCard && (
                <>
                  <img
                    src={`/images/${showAnswer ? `${currentCard.suit}-${currentCard.value}.svg` : 'card-back.png'}`}
                    alt={`${currentCard.suit}-${currentCard.value}`}
                    className="card_image" // Tailwind CSS classes added here
                  />
                </>
              )}
            </div>
            <div className="input-container">
              {values.map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    handleGuess(value);
                  }}
                  className={`value-button ${gameStatus !== 'readyToGuess' ? 'opacity-50' : ''}`}
                  disabled={gameStatus !== 'readyToGuess'} // Disable buttons when not ready to guess
                >
                  {value}
                </button>
              ))}
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
            </div>
          </div>
        </main >
      </div >
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['guess-the-card'])),
    },
  };
};

export default GuessTheCard;