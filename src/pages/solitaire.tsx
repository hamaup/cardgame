import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useSolitaireGame from './useSolitaireGame';
import styles from './solitaire.module.css';

const Card = ({ card, sourceType, sourceIndex, selectCard, autoMoveCard }) => {
  const cardImage = card.faceUp
    ? `/images/${card.suit}-${card.value}.svg`
    : '/images/card-back.png';

  const [clickCount, setClickCount] = useState(0);

  const [, drag, preview] = useDrag(() => ({
    type: 'CARD',
    item: { card, sourceType, sourceIndex },
  }));

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 1) {
      autoMoveCard(card, sourceType, sourceIndex);
      setClickCount(0);
    } else {
      selectCard(card, sourceType, sourceIndex);
      setTimeout(() => setClickCount(0), 300);
    }
  };

  return (
    <div
      className="card"
      onClick={handleClick}
      ref={preview}
    >
      <img
        src={cardImage}
        alt={`${card.suit} ${card.value}`}
        className={styles.card}
        ref={drag}
      />
    </div>
  );
};



const Foundation = ({ foundation, index, selectCard, moveCard, autoMoveCard }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => moveCard(item.card, 'foundation', index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={styles.foundation}>
      {foundation.length > 0 ? (
        <Card
          card={foundation[foundation.length - 1]}
          sourceType="foundation"
          sourceIndex={index}
          selectCard={selectCard}
          autoMoveCard={autoMoveCard}
        />
      ) : (
        'Empty'
      )}
    </div>
  );
};


const TableauColumn = ({ column, index, selectCard, moveCard, autoMoveCard }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => moveCard(item.card, 'tableauColumn', index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  return (
    <div ref={drop} className={styles.tableau_column}>
      {column.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className={styles.card}
          style={{
            top: `${cardIndex * 30}px`,
            zIndex: cardIndex,
          }}
        >
          <Card
            card={card}
            sourceType="tableauColumn"
            sourceIndex={index}
            selectCard={selectCard}
            autoMoveCard={autoMoveCard}
          />
        </div>
      ))}
    </div>
  );
};

const Solitaire = () => {
  const {
    tableauColumns,
    foundations,
    stock,
    waste,
    selectedCard,
    gameStatus,
    initializeGame,
    moveStockToWaste,
    selectCard,
    moveCard,
    autoMoveCard,
  } = useSolitaireGame();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.solitaire}>
        <div className={styles.stock} onClick={moveStockToWaste}>
          {stock.length > 0 ? (
            stock.map((card, index) => (
              <Card
                key={index}
                card={card}
                sourceType="stock"
                sourceIndex={index}
                selectCard={selectCard}
                autoMoveCard={autoMoveCard}
              />
            ))
          ) : (
            "Empty"
          )}
        </div>
        <div className={styles.waste}>
          {waste.length > 0 ? (
            <Card
              card={waste[waste.length - 1]}
              sourceType="waste"
              sourceIndex={null}
              selectCard={selectCard}
              autoMoveCard={autoMoveCard}
            />
          ) : (
            'Empty'
          )}
        </div>

        <div className={styles.foundations}>
          {foundations.map((foundation, index) => (
            <Foundation
              key={index}
              foundation={foundation}
              index={index}
              selectCard={selectCard}
              moveCard={moveCard}
              autoMoveCard={autoMoveCard}
            />
          ))}
        </div>
        <div className={styles.tableau_columns}>
          {tableauColumns.map((column, index) => (
            <TableauColumn
              key={index}
              column={column}
              index={index}
              selectCard={selectCard}
              moveCard={moveCard}
              autoMoveCard={autoMoveCard}
            />
          ))}
        </div>

        {gameStatus === 'won' && (
          <div className={styles.winOverlay}>
            <h2>Congratulations, you won!</h2>
            <button className={styles.button} onClick={initializeGame}>
              Play again
            </button>
          </div>
        )}
        <button className={styles.button} onClick={initializeGame}>
          Reset Game
        </button>
      </div>
    </DndProvider >
  );
};

export default Solitaire;
