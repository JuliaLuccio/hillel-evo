import Grid from './js/grid.js';
import { DIRECTION as D } from './js/helpers.js';

class Snake extends Grid {
	static gridContainerSelector = '#canvasForSnake';
	static snakeColor = '#2E8B57';
	static snakeHeadColor = '#24b730';
	static snakeEatHeadColor = '#e57373';
	static foodColor = '#F44336';
	static loseTextColor = '#607d8b';
	static storageKeySnakeRatingPrefix = 'snake_rating';

	#snake = [];
	#snakeHead = null;
	#foodCell = null;
	#process = null;
	#speed = 0;
	#score = 0;
	#playerName = "";
	#direction = null;
	#startBtn = this.find('#snake-start-game');
	#endBtn = this.find('#snake-end-game');
	#startOverBtn = this.find('#snake-start-over');
	#form = this.find('#snake-controls-form');
	#scoreContainer = this.find('#snake-score b');
	#playerNameContainer = this.find('#user-name b');
	#difficultyContainer = this.find('#user-difficulty b');
	#modalWindow = this.find('#snake-start-modal');
	#closeModalBtn = this.find('.closeModal');
	#ratingListUl = this.find('#rating-list');

	constructor({ cellSize, cellCount }) {
		super({
			cellSize,
			cellCount,
			gridContainerSelector: Snake.gridContainerSelector,
		});
		this.#init();
	}

	#init() {
		this.#startBtn.addEventListener('click', () => {
			this.#start();
		});

		this.#endBtn.addEventListener('click', () => {
			this.#endGame();
		});

		this.#closeModalBtn.addEventListener('click', () => {
			this.#closeModal();
			this.#initStartOverBtn();
		});

		document.addEventListener('keydown', event => {
			this.#updateDirection(event);
		});
	}

	#start() {
		this.#ratingListUl.innerHTML = '';
		this.#playerName = this.#form.playerName.value;
		this.#closeModal();
		this.#startOverBtn.classList.add('d-none');

		const startCell = 0;
		this.#generateStartSnakeCoord(startCell);
		this.#generateFoodCoord();
		this.#displayScore();
		this.#displayPlayerName();
		this.#displayDifficultyLvl();
		this.#speed = +this.#form.difficulty.value;
		this.#direction = D.DOWN;

		this.#endBtn.classList.remove('d-none');

		this.#process = setInterval(() => {
			this.#clear();
			this.buildGrid();
			this.#update();
		}, this.#speed);
	}

	#getSnakeHeadCoord() {
		const { x, y } = this.#noWallMode(this.#snake[0]);
		const snakeHead = { x, y };

		switch (this.#direction) {
			case D.LEFT:
				snakeHead.x -= this.cellSize;
				break;
			case D.RIGHT:
				snakeHead.x += this.cellSize;
				break;
			case D.UP:
				snakeHead.y -= this.cellSize;
				break;
			case D.DOWN:
				snakeHead.y += this.cellSize;
				break;
		}

		return snakeHead;
	}

	#clear() {
		this.context.clearRect(0, 0, this.gridContainer.width, this.gridContainer.height);
	}

	#update() {
		this.#drawSnake();
		this.#drawFood();
		this.#checkOnTailCrash();
		this.#snake.unshift(this.#getSnakeHeadCoord());
		this.#checkIfSnakeAte();
	}

	#drawSnake() {
		this.#snakeHead = this.#snake[0];
		this.context.fillStyle = Snake.snakeHeadColor;
		this.context.fillRect(
			this.#snakeHead.x,
			this.#snakeHead.y,
			this.cellSize - 1,
			this.cellSize - 1
		);

		this.context.fillStyle = Snake.snakeColor;
		for (let i = 1; i < this.#snake.length; i++) {
			this.context.fillRect(
				this.#snake[i].x,
				this.#snake[i].y,
				this.cellSize - 1,
				this.cellSize - 1
			);
		}
	}

	#drawFood() {
		const halfCell = this.cellSize / 2;
		this.context.beginPath();
		this.context.arc(
			this.#foodCell.x + halfCell,
			this.#foodCell.y + halfCell,
			halfCell - 1,
			0,
			Math.PI * 2,
			false
		);
		this.context.fillStyle = Snake.foodColor;
		this.context.fill();
	}

	#drawLoseText() {
		const fontSize = 50;
		const halfFontSize = fontSize / 2;
		const centerGrid = this.gridSize / 2;
		this.context.fillStyle = Snake.loseTextColor;
		this.context.font = `${fontSize}px Comic Sans MS`;
		this.context.textAlign = 'center';
		this.context.fillText(`Score: ${this.#score}`, centerGrid, centerGrid - halfFontSize);
		this.context.fillText('Lose', centerGrid, centerGrid + halfFontSize);
	}

	#updateDirection(event) {
		const key = event.key;

		if ((key === 'ArrowLeft' || key === 'a') && this.#direction !== D.RIGHT) {
			this.#direction = D.LEFT;
		} else if ((key === 'ArrowUp' || key === 'w') && this.#direction !== D.DOWN) {
			this.#direction = D.UP;
		} else if ((key === 'ArrowRight' || key === 'd') && this.#direction !== D.LEFT) {
			this.#direction = D.RIGHT;
		} else if ((key === 'ArrowDown' || key === 's') && this.#direction !== D.UP) {
			this.#direction = D.DOWN;
		}
	}

	#generateStartSnakeCoord(startCell, size = 5) {
		this.#snake = new Array(size).fill(null).map((_value, i) => {
			return { x: this.cellSize * startCell, y: this.cellSize * (size - 1 - i) };
		});
	}

	#noWallMode({ x, y }) {
		if (this.#direction === D.LEFT && x === 0) {
			x = this.cellCount * this.cellSize;
		}

		if (this.#direction === D.RIGHT && x === this.cellCount * this.cellSize - this.cellSize) {
			x = -this.cellSize;
		}

		if (this.#direction === D.UP && y === 0) {
			y = this.cellCount * this.cellSize;
		}

		if (this.#direction === D.DOWN && y === this.cellCount * this.cellSize - this.cellSize) {
			y = -this.cellSize;
		}

		return { x, y };
	}

	#generateFoodCoord() {
		this.#foodCell = {
			x: this.#randomCoord(),
			y: this.#randomCoord(),
		};

		if (this.#isSnake(this.#foodCell)) {
			this.#generateFoodCoord();
		}
	}

	#randomCoord() {
		return Math.floor(Math.random() * this.cellCount) * this.cellSize;
	}

	#isSnake({ x, y }, ignoreHead = false) {
		for (let i = ignoreHead ? 1 : 0; i < this.#snake.length; i++) {
			if (this.#snake[i].x === x && this.#snake[i].y === y) {
				return true;
			}
		}
		return false;
	}

	#checkIfSnakeAte() {
		if (this.#foodCell.x === this.#snakeHead.x && this.#foodCell.y === this.#snakeHead.y) {
			this.context.clearRect(this.#foodCell.x, this.#foodCell.y, this.cellSize, this.cellSize);
			this.#generateFoodCoord();
			this.#drawFood();
			this.#score += 1;
			this.#displayScore();
		} else {
			this.#snake.pop();
		}
	}

	#checkOnTailCrash() {
		if (this.#isSnake(this.#snakeHead, true)) {
			this.context.fillStyle = Snake.snakeEatHeadColor;
			this.context.fillRect(
				this.#snakeHead.x,
				this.#snakeHead.y,
				this.cellSize - 1,
				this.cellSize - 1
			);
			this.#endGame();
		}
	}

	#displayScore() {
		this.#scoreContainer.textContent = this.#score;
	}

	#displayPlayerName() {
		this.#playerNameContainer.textContent = this.#playerName;
	}

	#displayDifficultyLvl() {
		const selectElement = this.#form.difficulty;
		this.#difficultyContainer.textContent = selectElement.options[selectElement.selectedIndex].textContent;
	  }

	#initStartOverBtn() {
		this.#startOverBtn.classList.remove('d-none');
		this.#startOverBtn.addEventListener('click', () =>
			this.#modalWindow.classList.remove('d-none')
		);
	}

	#closeModal() {
		this.#modalWindow.classList.add('d-none');
	}

	#endGame() {
		clearInterval(this.#process);
		
		this.#saveData();
		
		this.#drawLoseText();
		this.#endBtn.classList.add('d-none');
		this.#initStartOverBtn();
		this.#score = 0;

		this.#showRatingList();
	}
	#saveToStorage(key, data) {
		localStorage.setItem(key, JSON.stringify(data));
	}

	#getFromStorage(key) {
		return JSON.parse(localStorage.getItem(key));
	}

	#getStorageKeySnakeRating() {
		return Snake.storageKeySnakeRatingPrefix + '_' + this.#difficultyContainer.textContent;
	}

	#saveData() {
		const playerStorageData = {
			"name": this.#playerName,
			"score": this.#score,
			"difficulty": this.#difficultyContainer.textContent,
		};

		const ratingData = this.#getFromStorage(this.#getStorageKeySnakeRating())??[];
		let playerNameIndex = ratingData.findIndex(item => item.name.toLowerCase() === this.#playerName.toLowerCase());
		if (playerNameIndex !== -1) {
			if (this.#score > ratingData[playerNameIndex].score) {
				ratingData[playerNameIndex].score = this.#score;
			}
		} else {
			ratingData.push(playerStorageData);
		}
		
		this.#saveToStorage(this.#getStorageKeySnakeRating(), ratingData);
	}

	#showRatingList() {
		this.#difficultyContainer.textContent
		const ratingData = this.#getFromStorage(this.#getStorageKeySnakeRating())??[];
		ratingData.sort((a, b) => b.score - a.score);
		ratingData.forEach(player => {
			this.#ratingListUl.innerHTML += `<li class='rating-list__item'>${player.name}: <b>${player.score}</b></li>`;
		});
	}
}

new Snake({
	cellSize: 20,
	cellCount: 25,
});
