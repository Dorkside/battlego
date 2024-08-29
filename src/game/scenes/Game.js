import { EventBus } from '../EventBus'
import { Scene } from 'phaser'

export class Game extends Scene {
  gridSize = 5
  cellSize = 32
  offsetX = 0
  offsetY = 0
  borderThickness = 2
  borderColor = 0x000000
  currentPlayer = 'black'

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

    this.offsetX = (this.sys.game.config.width - this.gridSize * this.cellSize) / 2
    this.offsetY = (this.sys.game.config.height - this.gridSize * this.cellSize) / 2

    this.layer = background.createLayer('Tile Layer 1', tileset, 0, 0)

    this.graphics = this.add.graphics()
    this.gridState = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(null))
    this.hoveredCell = null

    this.drawGrid()
    this.initCells()

    EventBus.on('current-grid-state', ({ gridState, hoveredCell }) => {
      this.gridState = gridState
      this.hoveredCell = hoveredCell
    })

    EventBus.emit('current-scene-ready', this)

    EventBus.on('turn-switched', (player) => {
      this.currentPlayer = player
    })
  }

  // following is the draw call for each frame
  update() {
    this.graphics.clear()
    this.drawGrid()
    this.drawState()
    this.drawHover()
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

        cell.on('pointerover', () => {
          EventBus.emit('player-hover', { x: i, y: j })
        })

        cell.on('pointerdown', () => {
          EventBus.emit('player-action', { action: { x: i, y: j } })
        })
      }
    }
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

  drawState() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize
        const y = this.offsetY + i * this.cellSize

        if (this.gridState[i][j] === 'black') {
          this.graphics.fillStyle(0x000000, 1)
          this.graphics.fillCircle(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            this.cellSize / 3.22
          )
        } else if (this.gridState[i][j] === 'white') {
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

  drawHover() {
    if (this.hoveredCell) {
      const { x, y } = this.hoveredCell
      if (this.currentPlayer === 'black') {
        this.graphics.fillStyle(0x000000, 0.5)
      }
      if (this.currentPlayer === 'white') {
        this.graphics.fillStyle(0xffffff, 0.5)
      }
      this.graphics.fillCircle(
        this.offsetX + x * this.cellSize + this.cellSize / 2,
        this.offsetY + y * this.cellSize + this.cellSize / 2,
        this.cellSize / 3.22
      )
    }
  }

  changeScene() {
    this.scene.start('GameOver')
  }
}

