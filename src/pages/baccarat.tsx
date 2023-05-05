import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Header from '../components/Header';
import styles from "./baccarat.module.css";

interface CardProps {
  card: {
    suit: string;
    value: string;
  };
}

interface Card {
  suit: string;
  value: string;
}

const CardComponent = ({ card }: CardProps) => {
  const { suit, value } = card;

  return (
    <img
      className={`${styles.card} ${styles[suit.toLowerCase()]}`}
      src={`/images/${suit}-${value}.svg`}
      alt={`${value} of ${suit}`}
    />
  );
};

interface HandProps {
  hand: Card[];
}

const Hand = ({ hand }: HandProps) => {
  return (
    <div className={styles.card_wrapper}>
      {hand.map((card, i) => (
        <CardComponent key={i} card={card} />
      ))}
    </div>
  );
};

interface ResultProps {
  playerHand: Card[];
  bankerHand: Card[];
  playerScore: number;
  bankerScore: number;
  resultMessage: string;
  onClose: () => void;
}

const Result = ({ playerScore, bankerScore, resultMessage }: ResultProps) => {
  return (
    <div className={styles.result}>
      <div className={styles.result_message}>{resultMessage}</div>
      <h2>Player Score: {playerScore}</h2>
      <h2>Banker Score: {bankerScore}</h2>
    </div>
  );
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

const Baccarat = () => {
  const { t } = useTranslation('baccarat');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [bankerScore, setBankerScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("init");
  const [message, setMessage] = useState(t('welcomeMessage'));
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    initializeGame();
  }, []);

  const generateDeck = () => {
    const suits = ["HEART", "DIAMOND", "CLUB", "SPADE"];
    const values = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
    const joker = { suit: "JOKER", value: "1" };
    const newDeck = [];

    for (let suitIdx = 0; suitIdx < suits.length; suitIdx++) {
      for (let valueIdx = 0; valueIdx < values.length; valueIdx++) {
        const card = {
          suit: suits[suitIdx],
          value: values[valueIdx],
        };
        newDeck.push(card);
      }
    }

    newDeck.push(joker);

    return newDeck;
  };


  const shuffleDeck = (deck: Card[]) => {
    for (let i = 0; i < deck.length; i++) {
      const randomIdx = Math.floor(Math.random() * deck.length);
      const tmp = deck[i];
      deck[i] = deck[randomIdx];
      deck[randomIdx] = tmp;
    }
  };

  const dealCards = () => {
    if (deck.length >= 4) {
      const card1 = deck.shift();
      const card2 = deck.shift();
      const card3 = deck.shift();
      const card4 = deck.shift();

      if (card1 && card2 && card3 && card4) {
        setPlayerHand([card1, card2]);
        setBankerHand([card3, card4]);
      } else {
        // Handle the case when there are not enough cards in the deck
        console.error('Not enough cards in the deck to deal');
      }
    } else {
      // Handle the case when there are not enough cards in the deck
      console.error('Not enough cards in the deck to deal');
    }
  };


  const calculatePoints = (hand: Card[]) => {
    let points = 0;
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];
      if (card.value === "11" || card.value === "12" || card.value === "13") {
        points += 0;
      } else if (card.value === "1") {
        points += 1;
      } else {
        points += parseInt(card.value);
      }
    }
    return points % 10;
  };
  const initializeGame = () => {
    const deck = generateDeck();
    shuffleDeck(deck);

    const initialPlayerHand = [deck[0], deck[2]];
    const initialBankerHand = [deck[1], deck[3]];

    const playerScore = calculatePoints(initialPlayerHand);
    const bankerScore = calculatePoints(initialBankerHand);

    setDeck(deck);
    dealCards();
    setPlayerHand(initialPlayerHand);
    setBankerHand(initialBankerHand);
    setPlayerScore(playerScore);
    setBankerScore(bankerScore);
    setGameStatus("playing");
  };
  const drawCard = () => {
    const card = deck.shift();
    return card;
  };

  const dealThirdCard = () => {
    if (playerScore >= 8 || bankerScore >= 8) {
      determineWinner();
    } else if (playerScore <= 5) {
      const thirdCard = drawCard();
      if (thirdCard) {
        const newPlayerHand = [...playerHand, thirdCard];
        const newPlayerScore = calculatePoints(newPlayerHand);
        setPlayerHand(newPlayerHand);
        setPlayerScore(newPlayerScore);
        setBankerScore(drawBankerCard(newPlayerScore, bankerScore));
      } else {
        // Handle the case when there are no more cards in the deck
      }
    } else if (bankerScore <= 5 && playerScore >= 6) {
      setBankerScore(drawBankerCard(playerScore, bankerScore));
    } else {
      determineWinner();
    }
  };

  const drawBankerCard = (playerScore: number, bankerScore: number) => {
    if (bankerScore >= 8 || playerScore >= 8) {
      return bankerScore;
    }
    if (bankerScore >= 6) {
      return bankerScore;
    }
    const thirdCard = drawCard();
    if (thirdCard) {
      const newBankerHand = [...bankerHand, thirdCard];
      const newBankerScore = calculatePoints(newBankerHand);
      setBankerHand(newBankerHand);
      return newBankerScore;
    } else {
      // Handle the case when there are no more cards in the deck
      return bankerScore;
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const drawBankerCard = async () => {
      if (bankerScore < 6) {
        await delay(1000); // 1秒待つ
        const thirdCard = drawCard();
        if (thirdCard) {
          const newBankerHand = [...bankerHand, thirdCard];
          const newBankerScore = calculatePoints(newBankerHand);
          setBankerHand(newBankerHand);
          setBankerScore(newBankerScore);
        } else {
          // Handle the case when there are no more cards in the deck
        }
      }
    };

    if (gameStatus === "playing" && bankerHand.length === 2) {
      drawBankerCard();
    }
  }, [bankerHand]);


  const determineWinner = () => {
    const playerPoints = calculatePoints(playerHand);
    const bankerPoints = calculatePoints(bankerHand);
    let resultMessage = "";

    if (playerPoints > bankerPoints) {
      resultMessage = t("PLAYER_WINS");
    } else if (bankerPoints > playerPoints) {
      resultMessage = t("BANKER_WINS");
    } else {
      resultMessage = t("TIE");
    }

    setResultMessage(resultMessage);

    // 結果表示に移行する
    setGameStatus(t("RESULT"));
    setModalIsOpen(true);
  };

  // ゲームの状態や操作を返す
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
          <h2 className="game-title">{t('title')}</h2>
          <div className="message-container">
            <div id="message">{message}</div>
          </div>

          <div className="game-container">
            <div className={styles.playing}>
              <div className={styles.hand}>
                <h2>Banker</h2>
                <Hand hand={bankerHand} />
                <h3>Score: {bankerScore}</h3>
              </div>
              <div className={styles.hand}>
                <h2>Player</h2>
                <Hand hand={playerHand} />
                <h3>Score: {playerScore}</h3>
              </div>
            </div>
            <div className="input-container">
              {gameStatus === "playing" && (
                <button className={styles.deal_third_button} onClick={dealThirdCard}>{t('dealThirdCardButton')}</button>
              )}
            </div>

            <Modal show={modalIsOpen} onClose={() => { setModalIsOpen(false); initializeGame(); }}>
              <Result
                playerHand={playerHand}
                bankerHand={bankerHand}
                playerScore={playerScore}
                bankerScore={bankerScore}
                resultMessage={resultMessage}
                onClose={() => {
                  initializeGame();
                  setModalIsOpen(false);
                }}
              />
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
        </main>
      </div>
    </>
  );

};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['baccarat'])),
    },
  };
};

export default Baccarat;
