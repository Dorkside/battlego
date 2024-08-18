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
    const background = this.add.tilemap('floors')
    const tileset = background.addTilesetImage('floors', 'floors')

    this.layer = background.createLayer('Tile Layer 1', tileset, 0, 0)

    this.currentPlayer = 'black'

    this.gridSize = 5
    this.cellSize = 32
    this.offsetX = (this.sys.game.config.width - this.gridSize * this.cellSize) / 2
    this.offsetY = (this.sys.game.config.height - this.gridSize * this.cellSize) / 2
    this.borderThickness = 2
    this.borderColor = 0x000000 // Black color

    this.graphics = this.add.graphics()
    this.gridState = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(null))

    this.drawGrid()
    this.initCells()

    EventBus.emit('current-scene-ready', this)
  }

  drawGrid() {
    this.graphics.lineStyle(this.borderThickness, this.borderColor)

    // Draw horizontal lines
    for (let i = 0; i <= this.gridSize - 1; i++) {
      const y = this.offsetY + i * this.cellSize + this.cellSize / 2
      this.graphics.moveTo(this.offsetX, y)
      this.graphics.lineTo(this.offsetX + this.gridSize * this.cellSize, y)
    }

    // Draw vertical lines
    for (let j = 0; j <= this.gridSize - 1; j++) {
      const x = this.offsetX + j * this.cellSize + this.cellSize / 2
      this.graphics.moveTo(x, this.offsetY)
      this.graphics.lineTo(x, this.offsetY + this.gridSize * this.cellSize)
    }

    this.graphics.strokePath()
  }

  initCells() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + i * this.cellSize
        const y = this.offsetY + j * this.cellSize

        const cell = this.add
          .rectangle(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            this.cellSize,
            this.cellSize,
            0x000000,
            0
          )
          .setInteractive() // Transparent fill

        cell.on('pointerdown', () => {
          // Check if the cell is already occupied
          if (this.gridState[j][i] !== null) {
            return // Cell is occupied, do nothing
          }

          EventBus.emit('player-action', {player: this.currentPlayer, action: {x: i, y: j}})

          // Update the grid state
          this.gridState[j][i] = this.currentPlayer

          this.graphics.clear()
          this.drawGrid()
          this.drawState()

          // Toggle the current player
          this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black'
        })
      }
    }
  }

  drawState() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + i * this.cellSize
        const y = this.offsetY + j * this.cellSize

        if (this.gridState[j][i] === 'black') {
          this.graphics.fillStyle(0x000000, 1)
          this.graphics.fillCircle(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            this.cellSize / 3.22
          )
        } else if (this.gridState[j][i] === 'white') {
          this.graphics.fillStyle(0xffffff, 1)
          this.graphics.fillCircle(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            this.cellSize / 3.22
          )
        }
      }
    }
  }

  changeScene() {
    this.scene.start('GameOver')
  }
}

