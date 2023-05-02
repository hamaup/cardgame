import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Header from '../components/Header';
import styles from './blackjack.module.css';

type CardType = {
  suit: string;
  value: string;
  image: string;
};

const Blackjack: React.FC = () => {
  const { t } = useTranslation('blackjack');
  const suits = ['HEART', 'DIAMOND', 'CLUB', 'SPADE'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '1'];

  const [deck, setDeck] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [message, setMessage] = useState(t('welcomeMessage'));

  useEffect(() => {
    startNewGame();
  }, []);

  const createDeck = () => {
    const newDeck: CardType[] = [];
    for (let suitIdx = 0; suitIdx < suits.length; suitIdx++) {
      for (let valueIdx = 0; valueIdx < values.length; valueIdx++) {
        const card: CardType = {
          suit: suits[suitIdx],
          value: values[valueIdx],
          image: `/images/${suits[suitIdx]}-${values[valueIdx]}.svg`,
        };
        newDeck.push(card);
      }
    }
    return newDeck;
  };

  const shuffleDeck = (deck: CardType[]) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  };

  const dealCards = (deck: CardType[], hand: CardType[], numCards: number) => {
    const newHand = [...hand];
    for (let i = 0; i < numCards; i++) {
      newHand.push(deck.pop() as CardType);
    }
    return newHand;
  };

  const Card = ({ card, hideFirstCard = false }: { card: CardType; hideFirstCard?: boolean }) => {
    if (hideFirstCard) {
      return <img src="/images/card-back.png" alt="Card back" className={styles.cardImage} />;
    }
    return <img src={card.image} alt={`${card.value} of ${card.suit}`} className={styles.cardImage} />;
  };

  const getCardValue = (card: CardType) => {
    if (card.value === '1') {
      return 11;
    } else if (card.value === '11' || card.value === '12' || card.value === '13') {
      return 10;
    } else {
      return parseInt(card.value);
    }
  };

  const calculateHandValue = (hand: CardType[]) => {
    let value = 0;
    let aceCount = 0;
    for (let i = 0; i < hand.length; i++) {
      const cardValue = getCardValue(hand[i]);
      if (cardValue === 11) {
        aceCount++;
      }
      value += cardValue;
    }

    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }

    return value;
  };

  const startNewGame = () => {
    const newDeck = createDeck();
    shuffleDeck(newDeck);
    const newDealerHand = dealCards(newDeck, [], 2);
    const newPlayerHand = dealCards(newDeck, [], 2);
    setDeck(newDeck);
    setDealerHand(newDealerHand);
    setPlayerHand(newPlayerHand);
    setGameOver(false);
    setGameResult('');
  };

  const endGame = () => {
    const dealerScore = calculateHandValue(dealerHand);
    const playerScore = calculateHandValue(playerHand);

    let resultText = "";
    if (dealerScore > 21 || playerScore > dealerScore) {
      resultText = t("player_wins");
    } else if (dealerScore === 21 && dealerHand.length === 2) {
      resultText = t("dealer_blackjack");
    } else if (playerScore === 21 && playerHand.length === 2) {
      resultText = t("player_blackjack");
    } else if (dealerScore < playerScore) {
      resultText = t("player_wins");
    } else if (dealerScore === playerScore) {
      resultText = t("tie");
    } else {
      resultText = t("dealer_wins");
    }
    resultText += "\n";
    resultText += `${t('dealer_score')}: ${calculateHandValue(dealerHand)}`;
    resultText += "\n";
    resultText += `${t('player_score')}: ${calculateHandValue(playerHand)}`;

    setGameOver(true);
    setGameResult(resultText);
  };

  const handleDealButtonClick = () => {
    if (gameOver) {
      startNewGame();
    }
  };

  const handleHitButtonClick = () => {
    const newPlayerHand = dealCards(deck, playerHand, 1);
    setPlayerHand(newPlayerHand);
    if (calculateHandValue(newPlayerHand) > 21) {
      setGameResult(t("player_busts").toString());
      setGameOver(true);
    }
  };

  const handleStandButtonClick = () => {
    let newDealerHand = [...dealerHand];
    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand = dealCards(deck, newDealerHand, 1);
    }
    setDealerHand(newDealerHand);
    endGame();
  };

  interface ModalProps {
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
    if (!show) {
      return null;
    }

    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalText}>{children}</div>
            <div className={styles.closeButtonContainer}>
              <button className={styles.closeButton} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div id="message">
              {message}
            </div>
          </div>

          <div className="game-container">
            <div className={styles.dealer}>
              <h2>{t("dealer")}</h2>
              <div className={styles.cards} id="dealer-hand">
                {dealerHand.map((card, index) => (
                  <Card key={index} card={card} hideFirstCard={!gameOver && index === 0} />
                ))}
              </div>
              <p id="dealer-score">{gameOver ? `Score: ${calculateHandValue(dealerHand)}` : ''}</p>
            </div>
            <div className={styles.player}>
              <h2>{t("player")}</h2>
              <div className={styles.cards} id="player-hand">
                {playerHand.map((card, index) => (
                  <Card key={index} card={card} />
                ))}
              </div>
              <p id="player-score">{`Score: ${calculateHandValue(playerHand)}`}</p>
            </div>
            <div className="input-container">
              <button id="deal-button" onClick={handleDealButtonClick}>
                {t("deal")}
              </button>
              <button
                id="hit-button"
                onClick={handleHitButtonClick}
                disabled={gameOver}
                className={`${styles.button} ${gameOver ? styles.disabledButton : ''}`}
              >
                {t("hit")}
              </button>
              <button
                id="stand-button"
                onClick={handleStandButtonClick}
                disabled={gameOver}
                className={`${styles.button} ${gameOver ? styles.disabledButton : ''}`}
              >
                {t("stand")}
              </button>

            </div>
            {gameOver && (
              <Modal show={gameOver} onClose={() => { setGameOver(false); startNewGame(); }}>
                <pre>{gameResult}</pre>
              </Modal>
            )}
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
    </ >
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['blackjack'])),
    },
  };
};

export default Blackjack;
