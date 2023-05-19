import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Header from '../components/Header';
import styles from './war.module.css';

type CardProps = {
  suit: string,
  value: number
};

const Card: FC<CardProps> = ({ suit, value }) => {
  const getImagePath = () => {
    return `/images/${suit}-${value}.svg`;
  }

  const cardClass = styles.card;

  return (
    <div className={cardClass}>
      <img src={getImagePath()} alt={`${value} of ${suit}`} />
    </div>
  );
};

type PlayerAreaProps = {
  nameKey: string,
  card: CardProps | null,
  score: number
};

const PlayerArea: FC<PlayerAreaProps> = ({ nameKey, card, score }) => {
  const { t } = useTranslation('war');
  const name = t(nameKey);

  return (
    <div className={styles.playerArea}>
      <h2>{name}</h2>
      {card && <Card {...card} />}
      <p>{t('cardsRemaining')}: {score}</p>
    </div>
  )
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: FC<ModalProps> = ({ show, onClose, children }) => {
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

const Game: FC = () => {
  const { t } = useTranslation('war');
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [opponentCard, setOpponentCard] = useState<Card | null>(null);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = React.useState<string | null>(null);
  const [message, setMessage] = useState<string>(t('welcomeMessage').toString());
  const [gameResult, setGameResult] = useState<string | null>(null);

  const suits = ["HEART", "DIAMOND", "CLUB", "SPADE"];
  const values = Array.from(Array(13).keys()).map(i => i + 1); // 1-13

  const deck = suits.flatMap(suit => values.map(value => ({ suit, value })));

  const dealCards = () => {
    let shuffledDeck = [...deck];

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }

    setPlayerDeck(shuffledDeck.slice(0, 26));
    setOpponentDeck(shuffledDeck.slice(26));
    setPlayerCard(null);
    setOpponentCard(null);
    setGameOver(false);
    setWinner(null);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (!playerDeck.length || !opponentDeck.length) {
      if (winner) {
        setGameOver(true);
        let gameResult = playerDeck.length > opponentDeck.length ? t('playerWinnerMessage') : t('opponentWinnerMessage');
        // Check the winner and set the appropriate message
        if (winner === 'Player') {
          setMessage(t('playerWinnerMessage').toString());
        } else if (winner === 'Opponent') {
          setMessage(t('opponentWinnerMessage').toString());
        }
        setGameResult(gameResult);
      }
    }
  }, [playerDeck, opponentDeck]);


  type Card = { suit: string, value: number };
  type Decks = {
    playerDeck: Card[],
    opponentDeck: Card[]
  };

  const handleWar = (
    playerDeck: Card[],
    opponentDeck: Card[],
    playerWarCards: Card[] = [],
    opponentWarCards: Card[] = []
  ): Decks | void => {
    setMessage(t('warMessage').toString()); // ワーゲームのメッセージを表示
    const playerCard = playerDeck[0];
    const opponentCard = opponentDeck[0];

    playerWarCards.push(playerCard);
    opponentWarCards.push(opponentCard);

    if (playerDeck.length < 4) {
      setGameOver(true);
      setWinner('Opponent');
      setMessage(t('notEnoughCardsForPlayer').toString()); // プレイヤーが十分なカードを引けない場合のメッセージを表示
      return { playerDeck: [], opponentDeck };
    } else if (opponentDeck.length < 4) {
      setGameOver(true);
      setWinner('Player');
      setMessage(t('notEnoughCardsForOpponent').toString()); // オポーネントが十分なカードを引けない場合のメッセージを表示
      return { playerDeck, opponentDeck: [] };
    } else {
      playerWarCards.push(...playerDeck.slice(1, 4));
      opponentWarCards.push(...opponentDeck.slice(1, 4));

      const playerDeckNew = playerDeck.slice(4);
      const opponentDeckNew = opponentDeck.slice(4);

      let playerFinalCard = playerWarCards[playerWarCards.length - 1];
      let opponentFinalCard = opponentWarCards[opponentWarCards.length - 1];

      if (playerFinalCard.value > opponentFinalCard.value) {
        playerDeckNew.push(...playerWarCards, ...opponentWarCards);
        setMessage(t('playerWonWar').toString()); // プレイヤーがワーゲームに勝利した場合のメッセージを表示
      } else if (opponentFinalCard.value > playerFinalCard.value) {
        opponentDeckNew.push(...opponentWarCards, ...playerWarCards);
        setMessage(t('opponentWonWar').toString()); // オポーネントがワーゲームに勝利した場合のメッセージを表示
      } else {
        return handleWar(playerDeckNew, opponentDeckNew, playerWarCards, opponentWarCards);
      }

      return { playerDeck: playerDeckNew, opponentDeck: opponentDeckNew };
    }
  };


  const drawCard = () => {
    if (playerDeck.length > 0 && opponentDeck.length > 0) {
      let playerCard = playerDeck[0];
      let opponentCard = opponentDeck[0];

      let playerDeckNew = playerDeck.slice(1);
      let opponentDeckNew = opponentDeck.slice(1);

      setPlayerCard(playerCard);
      setOpponentCard(opponentCard);

      if (playerCard.value > opponentCard.value) {
        playerDeckNew.push(playerCard, opponentCard);
      } else if (opponentCard.value > playerCard.value) {
        opponentDeckNew.push(opponentCard, playerCard);
      } else {
        const result = handleWar(playerDeck, opponentDeck);
        if (result && 'playerDeck' in result && 'opponentDeck' in result) {
          playerDeckNew = result.playerDeck;
          opponentDeckNew = result.opponentDeck;
        }
      }

      if (playerDeckNew.length === 0) {
        setWinner('Opponent');
        setGameOver(true);
      }
      if (opponentDeckNew.length === 0) {
        setWinner('Player');
        setGameOver(true);
      }

      setPlayerDeck(playerDeckNew);
      setOpponentDeck(opponentDeckNew);
    }
  };


  const startNewGame = () => {
    dealCards(); // Deal new cards
    setGameOver(false); // Reset game over state
    setWinner(null); // Reset winner state
    setPlayerCard(null); // Reset current player card
    setOpponentCard(null); // Reset current opponent card
    setMessage(t('welcomeMessage').toString());
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
            <div className={styles.game}>
              <>
                <div className={styles.gameBoard}>
                  {/* プレイヤーエリアとオポーネントエリアの描画 */}
                  <PlayerArea nameKey="playerName" card={playerCard} score={playerDeck.length} />
                  <PlayerArea nameKey="bunkerName" card={opponentCard} score={opponentDeck.length} />
                </div>
                <div className={styles.buttonContainer}>
                  <button className={styles.button} disabled={(!playerDeck.length || !opponentDeck.length)} onClick={drawCard}>Draw Card</button>
                  <button className={styles.button} onClick={startNewGame}>Reset</button>
                </div>
              </>
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
      ...(await serverSideTranslations(locale, ['war'])),
    },
  };
};

export default Game;