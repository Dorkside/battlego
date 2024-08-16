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

    const gridSize = 5
    const cellSize = 32
    const offsetX = (this.sys.game.config.width - gridSize * cellSize) / 2
    const offsetY = (this.sys.game.config.height - gridSize * cellSize) / 2
    const borderThickness = 5
    const borderColor = 0x000000 // Black color

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = offsetX + i * cellSize
        const y = offsetY + j * cellSize

        const graphics = this.add.graphics()
        graphics.lineStyle(borderThickness, borderColor)
        graphics.strokeRoundedRect(x, y, cellSize, cellSize, 10) // Rounded corners with radius 10

        const cell = this.add
          .rectangle(x + cellSize / 2, y + cellSize / 2, cellSize, cellSize, 0x000000, 0)
          .setInteractive() // Transparent fill
        cell.on('pointerdown', () => {
          graphics.clear()
          graphics.lineStyle(borderThickness, 0xff0000) // Change border color to red on click
          graphics.strokeRoundedRect(x, y, cellSize, cellSize, 10)
        })
      }
    }

    EventBus.emit('current-scene-ready', this)
  }

  changeScene() {
    this.scene.start('GameOver')
  }
}

