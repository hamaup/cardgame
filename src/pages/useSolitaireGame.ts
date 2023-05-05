// useSolitaireGame.ts
import { useState, useEffect, useRef } from "react";

const useSolitaireGame = () => {
	const [deck, setDeck] = useState([]);
	const [tableauColumns, setTableauColumns] = useState([
		[],
		[],
		[],
		[],
		[],
		[],
		[],
	]);
	const [foundations, setFoundations] = useState([[], [], [], []]);
	const [stock, setStock] = useState([]);
	const [waste, setWaste] = useState([]);
	const [selectedCard, setSelectedCard] = useState(null);
	const [gameStatus, setGameStatus] = useState("initial");

	// カードデッキの生成
	const generateDeck = () => {
		const suits = ["HEART", "DIAMOND", "CLUB", "SPADE"];
		const values = [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
		];
		const newDeck = [];

		for (let suitIdx = 0; suitIdx < suits.length; suitIdx++) {
			for (let valueIdx = 0; valueIdx < values.length; valueIdx++) {
				const card = {
					suit: suits[suitIdx],
					value: values[valueIdx],
					faceUp: false,
					color:
						suits[suitIdx] === "HEART" || suits[suitIdx] === "DIAMOND"
							? "red"
							: "black",
				};
				newDeck.push(card);
			}
		}

		return newDeck;
	};

	// カードデッキのシャッフル
	const shuffleDeck = (deck) => {
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
	};

	// ゲームの初期化処理
	const initializeGame = () => {
		const newDeck = generateDeck();
		shuffleDeck(newDeck);

		const newTableauColumns = tableauColumns.map((_, index) => {
			const columnCards = newDeck.splice(-1 * (index + 1));
			columnCards[columnCards.length - 1].faceUp = true;
			return columnCards;
		});
		setDeck(newDeck);
		setTableauColumns(newTableauColumns);
		setStock(newDeck);
		setWaste([]);
		setSelectedCard(null);
		setGameStatus("playing");
	};

	const selectCard = (card, sourceType, sourceIndex) => {
		// すでに選択されているカードがある場合
		if (selectedCard) {
			// 選択されているカードがもう一度クリックされた場合
			if (
				selectedCard.card === card &&
				selectedCard.sourceType === sourceType &&
				selectedCard.sourceIndex === sourceIndex
			) {
				setSelectedCard(null); // 選択を解除

				// ウェイストのカードをクリックして選択を解除した場合、ストックに戻す
				if (sourceType === "waste") {
					const newStock = [...stock, card];
					const newWaste = waste.slice(0, -1);
					setStock(newStock);
					setWaste(newWaste);
				}
			} else {
				moveCard(card, sourceType, sourceIndex);
			}
		} else if (card?.faceUp) {
			// 選択されていない状態で表向きのカードがクリックされた場合
			setSelectedCard({ card, sourceType, sourceIndex });
		}
	};


	const autoMoveCard = (card, sourceType, sourceIndex) => {
		if (sourceType === 'waste' || sourceType === 'tableauColumn') {
			// Try moving the card to the appropriate foundation first
			for (let i = 0; i < foundations.length; i++) {
				if (moveCard(card, sourceType, sourceIndex, 'foundation', i)) {
					return;
				}
			}
			// If moving to a foundation is not possible, try moving it to an appropriate tableau column
			if (sourceType === 'tableauColumn') {
				for (let i = 0; i < tableauColumns.length; i++) {
					if (i !== sourceIndex && moveCard(card, sourceType, sourceIndex, 'tableauColumn', i)) {
						return;
					}
				}
			}
		}
	};

	// カードの移動などのゲームロジックを実装
	const moveCard = (card, sourceType, sourceIndex, destinationType, destinationIndex) => {

		console.log(destinationCard, destinationType, destinationIndex)
		if (destinationType === "tableauColumn") {
			if (isMoveToTableauColumnValid(card, destinationCard)) {
				// Move the card to the destination tableau column
				const destinationColumn = tableauColumns[destinationIndex];
				destinationColumn.push(card);

				// Update the source tableau column or waste
				if (sourceType === "tableauColumn") {
					const sourceColumn = tableauColumns[sourceIndex];
					sourceColumn.pop();

					// Add this code here
					if (
						sourceColumn.length > 0 &&
						!sourceColumn[sourceColumn.length - 1].faceUp
					) {
						sourceColumn[sourceColumn.length - 1].faceUp = true;
					}
				} else if (sourceType === "waste") {
					setWaste(waste.slice(0, -1));
				}

				// Unselect the card
				setSelectedCard(null);
				return true;
			}
		} else if (destinationType === "foundation") {
			if (isMoveToFoundationValid(card, destinationCard)) {
				// Move the card to the destination foundation
				const destinationFoundation = foundations[destinationIndex];
				destinationFoundation.push(card);

				// Update the source tableau column or waste
				if (sourceType === "tableauColumn") {
					const sourceColumn = tableauColumns[sourceIndex];
					sourceColumn.pop();
				} else if (sourceType === "waste") {
					setWaste(waste.slice(0, -1));
				}
				// Unselect the card
				setSelectedCard(null);

				// Check if the win condition is met
				if (checkWinCondition()) {
					setGameStatus("won");
				}
				return true;
			}
		}
		return false;
	};

	const moveStockToWaste = () => {
		if (stock.length > 0) {
			const newWaste = [
				...waste,
				...stock.splice(-1).map((card) => ({ ...card, faceUp: true })),
			];

			setStock(stock);
			setWaste(newWaste);
		} else {
			const newStock = waste.map((card) => ({ ...card, faceUp: false }));
			setStock(newStock);
			setWaste([]);
		}
	};

	const isMoveToTableauColumnValid = (sourceCard, destinationCard) => {
		// Check if the destination card is empty
		if (!destinationCard) {
			// Allow the move if the source card is a King
			return sourceCard.value === "13";
		}

		// Check if the source card and the destination card have different colors and
		// the source card's value is one less than the destination card's value
		const isDifferentColor =
			(sourceCard.color === "red" && destinationCard.color === "black") ||
			(sourceCard.color === "black" && destinationCard.color === "red");
		const isValueOneLess =
			parseInt(sourceCard.value) + 1 === parseInt(destinationCard.value);

		return isDifferentColor && isValueOneLess;
	};

	const isMoveToFoundationValid = (sourceCard, destinationCard) => {
		// Check if the destination foundation is empty
		if (!destinationCard) {
			// Allow the move if the source card is an Ace
			return sourceCard.value === "1";
		}

		// Check if the source card and the destination card have the same suit and
		// the source card's value is one more than the destination card's value
		const isSameSuit = sourceCard.suit === destinationCard.suit;
		const isValueOneMore =
			parseInt(sourceCard.value) - 1 === parseInt(destinationCard.value);

		return isSameSuit && isValueOneMore;
	};

	// ゲームの勝利条件をチェック
	const checkWinCondition = () => {
		// Check if all foundation piles have a King as the top card
		return foundations.every(
			(pile) => pile.length === 13 && pile[pile.length - 1].value === "13",
		);
	};

	// ゲームの初期化処理を実行
	useEffect(() => {
		initializeGame();
	}, []);

	// ゲームの状態や操作を返す
	return {
		deck,
		tableauColumns,
		foundations,
		stock,
		waste,
		selectedCard,
		gameStatus,
		moveCard,
		initializeGame,
		moveStockToWaste,
		selectCard,
		autoMoveCard,
	};
};

export default useSolitaireGame;
