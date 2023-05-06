import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Header from '../components/Header';
import styles from './memory-game.module.css';
import Confetti from 'react-confetti';

interface Card {
  suit: string;
  value: string;
  id: string;
  image: string;
}

const MemoryGame: React.FC = () => {
  const { t } = useTranslation('memory-game');
  const [message, setMessage] = useState<string>(t('welcomeMessage').toString());
  const [cards, setCards] = useState<Card[]>([]);
  const [matchedCards, setMatchedCards] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const suits: string[] = ['HEART', 'DIAMOND', 'CLUB', 'SPADE'];
  const values: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

  useEffect(() => {
    const createDeck = (): Card[] => {
      const deck: Card[] = [];
      for (let suit of suits) {
        for (let value of values) {
          deck.push({
            suit,
            value,
            id: `${suit}-${value}`,
            image: `/images/${suit}-${value}.svg`,
          });
        }
      }
      return deck;
    };

    const shuffleDeck = (deck: Card[]) => {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    };

    const deck: Card[] = createDeck();
    shuffleDeck(deck);

    const cardsDeck: Card[] = deck.slice(0, 10);
    const pairedDeck: Card[] = [...cardsDeck, ...cardsDeck];

    shuffleDeck(pairedDeck);
    setCards(pairedDeck);
  }, []);

  const handleCardClick = (index: number) => {
    if (matchedCards.includes(cards[index].id) || selectedCards.includes(index)) {
      return;
    }
    if (selectedCards.length < 2 && !selectedCards.includes(index)) {
      const newSelectedCards = [...selectedCards, index];
      setSelectedCards(newSelectedCards);
      if (newSelectedCards.length === 2) {
        setTimeout(() => {
          checkMatch(newSelectedCards);
        }, 1000);
      }
    }
  };

  const checkMatch = (selectedCardsToCheck: number[]) => {
    if (selectedCardsToCheck.length === 2) {
      const [firstCard, secondCard] = selectedCardsToCheck;
      if (cards[firstCard].id === cards[secondCard].id) {
        setMatchedCards([...matchedCards, cards[firstCard].id]);
        setSelectedCards([]);
      } else {
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length !== 0 && matchedCards.length !== 0 && matchedCards.length === cards.length / 2) {
      setMessage(t('winMessage').toString());
      setShowConfetti(true);
    }
  }, [matchedCards]);

  return (
    <>
      <Head>
        <title>{t('title').toString()}</title>
        <meta name="description" content={t('description').toString()} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showConfetti && <Confetti />}
      <div className="container">
        <Header />
        <main className="main-content">
          <h2 className="game-title">{t('title')}</h2>
          <div className="message-container">
            <div id="message">{message}</div>
          </div>

          <div className="game-container">
            <div className={styles.memory_card_container}>
              {cards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className={`${styles.card} ${selectedCards.includes(index) || matchedCards.includes(card.id)
                    ? 'card-selected'
                    : ''
                    }`}
                  onClick={() => handleCardClick(index)}
                >
                  <img
                    src={
                      selectedCards.includes(index) || matchedCards.includes(card.id)
                        ? card.image
                        : '/images/card-back.png'
                    }
                    alt={card.id}
                    className={styles.card_image}
                  />
                </div>
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
      ...(await serverSideTranslations(locale, ['memory-game'])),
    },
  };
};

export default MemoryGame;
