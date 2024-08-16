import { EventBus } from '../EventBus'
import { Scene } from 'phaser'

export class Game extends Scene {
  constructor() {
    super('Game')
  }

  preload() {
    // chargement tuiles de jeu
    this.load.image('floors', 'assets/floors.png')

    // chargement de la carte
    this.load.tilemapTiledJSON('floors', 'assets/base.json')
  }

  create() {
    // Create a tile sprite that repeats the selected tile across the background
    const background = this.add.tilemap("floors");

    const tileset = background.addTilesetImage(
      "floors",
      "floors"
    );

    const layer = background.createLayer("Tile Layer 1", tileset, 0, 0);

    let currentPlayer = 'black';

    this.gridSize = 5
    this.cellSize = 32
    this.offsetX = (this.sys.game.config.width - this.gridSize * this.cellSize) / 2
    this.offsetY = (this.sys.game.config.height - this.gridSize * this.cellSize) / 2
    this.borderThickness = 2;
    this.borderColor = 0x000000 // Black color

    this.graphics = this.add.graphics();

    this.drawGrid();

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + i * this.cellSize
        const y = this.offsetY + j * this.cellSize

        const cell = this.add
          .rectangle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize, this.cellSize, 0x000000, 0)
          .setInteractive(); // Transparent fill

        cell.on('pointerdown', () => {
          // Draw a circle filled with the current player's color
          const fillColor = currentPlayer === 'black' ? 0x000000 : 0xffffff; // Black or white color
          this.graphics.fillStyle(fillColor, 1);
          this.graphics.fillCircle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 3.22);

          // Toggle the current player
          currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        });
      }
    }

    EventBus.emit('current-scene-ready', this)
  }

  drawGrid() {
    this.graphics.lineStyle(this.borderThickness, this.borderColor)

    // Draw horizontal lines
    for (let i = 0; i <= this.gridSize - 1; i++) {
      const y = this.offsetY + i * this.cellSize + this.cellSize / 2;
      this.graphics.moveTo(this.offsetX, y);
      this.graphics.lineTo(this.offsetX + this.gridSize * this.cellSize, y);
    }

    // Draw vertical lines
    for (let j = 0; j <= this.gridSize - 1; j++) {
      const x = this.offsetX + j * this.cellSize + this.cellSize / 2;
      this.graphics.moveTo(x, this.offsetY);
      this.graphics.lineTo(x, this.offsetY + this.gridSize * this.cellSize);
    }

    this.graphics.strokePath();
  }

  changeScene() {
    this.scene.start('GameOver')
  }
}

