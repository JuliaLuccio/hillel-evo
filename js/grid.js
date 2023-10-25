import { Manipulator } from './helpers.js';

export default class extends Manipulator {
	constructor({ cellSize, cellCount, gridContainerSelector }) {
		super();

		this.cellSize = cellSize;
		this.cellCount = cellCount;
		this.gridSize = this.cellSize * this.cellCount;
		this.gridContainer = this.find(gridContainerSelector);
		if (this.gridContainer.getContext) {
			this.context = this.gridContainer.getContext('2d');
		}

		this.gridColor = '#cfcfcf';

		this.buildGrid();
	}

	buildGrid() {
		this.gridContainer.width = this.gridContainer.height = this.gridSize;

		this.context.fillStyle = this.gridColor;
		for (let i = 0; i < this.cellCount; i++) {
			for (let j = 0; j < this.cellCount; j++) {
				this.context.fillRect(i * this.cellSize, j * this.cellSize, this.cellSize - 1, this.cellSize - 1);
			}
		}
	}
}
