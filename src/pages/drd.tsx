import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableCard = ({ suit, value, color }) => {
  const imagePath = `/images/${suit.toUpperCase()}-${value}.svg`;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { suit, value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const cardStyle = {
    display: 'inline-block',
    marginRight: '10px',
    border: '1px solid black',
    borderRadius: '5px',
    width: '50px',
    height: '80px',
    padding: '5px',
    backgroundColor: color,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div style={cardStyle} ref={drag}>
      <img src={imagePath} alt={`${value} of ${suit}`} width="40" height="60" />
    </div>
  );
};

const Card = ({ suit, value, color }) => {
  const imagePath = `/images/${suit.toUpperCase()}-${value}.svg`;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',
    item: { suit, value },
    collect: (monitor) => ({
      isDragging: monitor && monitor.isDragging(),
    }),
  }));
  const cardStyle = {
    display: 'inline-block',
    marginRight: '10px',
    border: '1px solid black',
    borderRadius: '5px',
    width: '50px',
    height: '80px',
    padding: '5px',
    backgroundColor: color,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div style={cardStyle} ref={drag}>
      <img src={imagePath} alt={`${value} of ${suit}`} width="40" height="60" />
    </div>
  );
};

const CardStack = ({ cards }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item, monitor) => handleCardDrop(item, monitor),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const cardList = cards.map((card, i) => ({
    ...card,
    index: i,
  }));

  const handleCardDrop = (item, monitor) => {
    const { index: sourceIndex } = item;
    const dropResult = monitor && monitor.getDropResult();
    const { index: targetIndex } = dropResult || {};

    if (sourceIndex === targetIndex) {
      return;
    }


    // get the source stack and the card that was dragged
    const sourceStack = cards;
    const card = sourceStack[sourceIndex];

    // remove the card from the source stack
    sourceStack.splice(sourceIndex, 1);

    // get the target stack and insert the card at the target index
    const targetStack = cards;
    targetStack.splice(targetIndex, 0, card);

    // update the state to re-render the component
    setCards([...cards]);
  };


  return (
    <div ref={drop}>
      {cardList.map((card, i) => (
        <div key={i}>
          <Card {...card} />
          <DropTargetCard index={i} onDrop={handleCardDrop} />
        </div>
      ))}
    </div>
  );
};

const DropTargetCard = ({ index, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: onDrop(index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropStyle = {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '50px',
    height: '80px',
    zIndex: '-1',
    opacity: isOver ? 0.5 : 0,
    backgroundColor: 'white',
  };

  return <div ref={drop} style={dropStyle} />;
};

const App = () => {
  const initialCards = [
    { suit: 'heart', value: '1', color: 'red' },
    { suit: 'spade', value: '2', color: 'black' },
    { suit: 'heart', value: '3', color: 'red' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <CardStack cards={initialCards} />
    </DndProvider>
  );
};

export default App;

