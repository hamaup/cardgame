import React, { useState, useEffect, FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Header from '../components/Header';
import styles from './draw-poker.module.css';

interface Card {
  suit: string;
  rank: number;
  image: string;
}

interface CardProps {
  card: Card;
  selected: boolean;
  onClick: () => void;
}

const CardComponent: React.FC<CardProps> = ({ card, selected, onClick }) => {
  return (
    <img
      className={`card ${selected ? 'selected' : ''}`}
      src={card.image}
      alt={`${card.rank} of ${card.suit}`}
      onClick={onClick}
    />
  );
};

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: FC<ModalProps> = ({ show, onClose, children }) => {
  const { t } = useTranslation('draw-poker');
  if (!show) {
    return null;
  }
  let resultContent;
  if (children === null || children === undefined) {
    resultContent = t('handEvaluationFailed');
  } else if (children === '') {
    resultContent = t('highCardMessage');
  } else {
    resultContent = t('congratulationsMessage') + " " + children;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalText}>{resultContent}</div>
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

const DrawPokerGame: React.FC = () => {
  const { t } = useTranslation('draw-poker');
  // ゲームのデッキを作成する。デッキはスートとランクの組み合わせの配列で表現される
  const suits = ['CLUB', 'DIAMOND', 'HEART', 'SPADE'];
  const ranks = Array.from({ length: 13 }, (_, i) => i + 1); // 1 (Ace) to 13 (King)
  const deck: Card[] = suits.flatMap(suit =>
    ranks.map(rank => ({
      suit,
      rank: rank,
      image: `${suit}_${rank}.png`, // placeholder, replace with actual image path/naming convention
    }))
  );
  // ゲームの状態を管理するためのstate変数を作成する
  const [gameDeck, setGameDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(t('welcomeMessage').toString());

  // ゲームが開始するとき、デッキをシャッフルし、プレイヤーに5枚のカードを配る
  useEffect(() => {
    const shuffledDeck = shuffle(deck);
    const initialHand = dealCards(shuffledDeck, 5);
    setGameDeck(shuffledDeck);
    setPlayerHand(initialHand);
  }, []);

  // カードをシャッフルする関数
  function shuffle(array: Card[]): Card[] {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  // デッキからカードを配る関数
  function dealCards(deck: Card[], numCards: number): Card[] {
    return deck.splice(0, numCards);
  }

  // プレイヤーがカードをクリックしたときのハンドラ
  function handleCardClick(card: Card): void {
    setSelectedCards(prevSelectedCards => {
      if (prevSelectedCards.includes(card)) {
        // If the card is already selected, unselect it
        const newSelectedCards = prevSelectedCards.filter(c => c !== card);
        return newSelectedCards;
      } else {
        // Else, select the card
        return [...prevSelectedCards, card];
      }
    });
  }

  // ドローの動作を行う関数
  function drawCards(): void {
    const remainingDeck = [...gameDeck];
    const newCards = dealCards(remainingDeck, selectedCards.length);

    const newHand = playerHand.map(card => {
      if (selectedCards.includes(card)) {
        // Ensure that newCards.pop() is not undefined
        const newCard = newCards.pop();
        return newCard ? newCard : card;
      } else {
        return card;
      }
    });

    setGameDeck(remainingDeck);
    setPlayerHand(newHand);
    setSelectedCards([]);
    setResult(evaluateHand(newHand)); // Evaluate hand after drawing
    setShowResult(true); // Show the result
    setMessage(t('drawCardsMessage').toString());
  }



  // 手札の勝敗を判定する関数
  function evaluateHand(hand: Card[]): string {
    // Count the frequency of each rank
    const rankCounts = hand.reduce((counts, card) => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
      return counts;
    }, {} as { [key: number]: number });

    // Check if all cards have the same suit (flush)
    const suits = new Set(hand.map(card => card.suit));
    const isFlush = suits.size === 1;

    // Check if the hand is a straight (5 consecutive ranks)
    const ranks = hand.map(card => card.rank).sort();
    const isStraight = ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);

    // Check if the hand contains an Ace
    const hasAce = ranks.includes(1);

    // Check from high rank to low rank
    if (isFlush && isStraight && hasAce) {
      return t('royalFlush');
    } else if (isFlush && isStraight) {
      return t('straightFlush');
    } else if (Object.values(rankCounts).includes(4)) {
      return t('fourOfAKind');
    } else if (Object.values(rankCounts).includes(3) && Object.values(rankCounts).includes(2)) {
      return t('fullHouse');
    } else if (isFlush) {
      return t('flush');
    } else if (isStraight) {
      return t('straight');
    } else if (Object.values(rankCounts).includes(3)) {
      return t('threeOfAKind');
    } else if (new Set(Object.values(rankCounts)).has(2) && Object.values(rankCounts).filter(val => val === 2).length === 2) {
      return t('twoPair');
    } else if (Object.values(rankCounts).includes(2)) {
      return t('onePair');
    } else {
      return t('highCard');
    }
  }


  useEffect(() => {
    initializeGame();
  }, []);

  function handleReset(): void {
    initializeGame();
    setMessage(t('resetGameMessage').toString());
  }

  function initializeGame(): void {
    const shuffledDeck = shuffle(deck);
    const initialHand = dealCards(shuffledDeck, 5);
    setGameDeck(shuffledDeck);
    setPlayerHand(initialHand);
    setSelectedCards([]);
    setResult(null);
    setShowResult(false);
    setMessage(t('welcomeMessage').toString());
  }

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
            <div className={styles.cardContainer}>
              {playerHand.map(card => (
                <CardComponent
                  key={`${card.suit} -${card.rank} `}
                  card={card}
                  selected={selectedCards.includes(card)}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={drawCards}>Draw</button>
              <button onClick={handleReset}>Reset</button> {/* Add a button to reset the game */}
            </div>
            <Modal show={showResult} onClose={() => {
              setShowResult(false);
              initializeGame();
            }}>
              {result}
            </Modal>
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
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['draw-poker'])),
    },
  };
};

export default DrawPokerGame;
