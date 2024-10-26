import { EventBus } from '../EventBus'
import { Scene } from 'phaser'

export class Game extends Scene {
  gridSize = 5
  cellSize = 32
  offsetX = 0
  offsetY = 0
  borderThickness = 2
  borderColor = 0xffffff
  currentPlayer = 'black'
  gameOver = false

  constructor() {
    super('Game')
  }

  preload() {}

  create() {
    this.offsetX = (this.sys.game.config.width - this.gridSize * this.cellSize) / 2
    this.offsetY = (this.sys.game.config.height - this.gridSize * this.cellSize) / 2

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

      this.render()
    })

    EventBus.on('game-over', () => {
      this.gameOver = true
      this.render()
    })

    EventBus.on('new-game', () => {
      this.gameOver = false
      this.render()
    })

    EventBus.emit('current-scene-ready', this)

    EventBus.on('turn-switched', (player) => {
      this.currentPlayer = player
    })
  }

  // following is the draw call for each frame
  update() {}

  render() {
    this.graphics.clear()
    this.drawGrid()
    this.drawState()
    if (!this.gameOver) {
      this.drawHover()
    } else {
      this.drawScore()
    }
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
      this.graphics.moveTo(0, y)
      this.graphics.lineTo(480, y)
    }

    // Draw vertical lines
    for (let j = 0; j <= this.gridSize - 1; j++) {
      const x = this.offsetX + j * this.cellSize + this.cellSize / 2
      this.graphics.moveTo(x, 0)
      this.graphics.lineTo(x, 480)
    }

    this.graphics.strokePath()

    // Draw central hoshi
    const hoshiRadius = 4
    this.graphics.fillStyle(0xffffff, 1)
    this.graphics.fillCircle(
      this.offsetX + (this.gridSize / 2) * this.cellSize,
      this.offsetY + (this.gridSize / 2) * this.cellSize,
      hoshiRadius
    )
  }

  drawState() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize
        const y = this.offsetY + i * this.cellSize

        if (this.gridState[i][j] === 'black') {
          this.graphics.fillStyle(0xffffff, 1)
          this.graphics.fillCircle(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            this.cellSize / 3.22
          )
          this.graphics.fillStyle(0x000000, 1)
          this.graphics.fillCircle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 4)
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

  drawScore() {
    let blackScore = 0
    let whiteScore = 0
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize
        const y = this.offsetY + i * this.cellSize

        this.graphics.fillStyle(0x000000, 0)

        if (this.gridState[i][j] === 'black') {
          this.graphics.fillStyle(0x000000, 1)
          blackScore++
        } else if (this.gridState[i][j] === 'white') {
          this.graphics.fillStyle(0xffffff, 1)
          whiteScore++
        } else {
          // check if the cell has the most black or white neighbours
          let neighbours = []

          if (i > 0 && this.gridState[i - 1][j] !== null) {
            neighbours.push(this.gridState[i - 1][j])
          }
          if (i < 4 && this.gridState[i + 1][j] !== null) {
            neighbours.push(this.gridState[i + 1][j])
          }
          if (j > 0 && this.gridState[i][j - 1] !== null) {
            neighbours.push(this.gridState[i][j - 1])
          }
          if (j < 4 && this.gridState[i][j + 1] !== null) {
            neighbours.push(this.gridState[i][j + 1])
          }

          const result = neighbours
            .map((cell) => {
              if (cell === 'black') return 1
              if (cell === 'white') return -1
              return 0
            })
            .reduce((acc, curr) => acc + curr, 0)

          if (result > 0) {
            this.graphics.fillStyle(0x000000, 1)
            blackScore++
          }
          if (result < 0) {
            this.graphics.fillStyle(0xffffff, 1)
            whiteScore++
          }
        }

        this.graphics.fillRect(x, y, this.cellSize, this.cellSize)
      }
    }

    let winner = 'Nobody'
    if (blackScore !== whiteScore) {
      winner = blackScore > whiteScore ? 'Black' : 'White'
    }

    EventBus.emit('game-winner', winner)
  }

  drawHover() {
    if (this.hoveredCell) {
      const { x, y } = this.hoveredCell
      if (this.currentPlayer === 'black') {
        this.graphics.fillStyle(0xffffff, 0.5)
        this.graphics.fillCircle(
          this.offsetX + x * this.cellSize + this.cellSize / 2,
          this.offsetY + y * this.cellSize + this.cellSize / 2,
          this.cellSize / 3.22
        )
        this.graphics.fillStyle(0x000000, 0.5)
        this.graphics.fillCircle(
          this.offsetX + x * this.cellSize + this.cellSize / 2,
          this.offsetY + y * this.cellSize + this.cellSize / 2,
          this.cellSize / 4
        )
      } else if (this.currentPlayer === 'white') {
        this.graphics.fillStyle(0xffffff, 0.5)
        this.graphics.fillCircle(
          this.offsetX + x * this.cellSize + this.cellSize / 2,
          this.offsetY + y * this.cellSize + this.cellSize / 2,
          this.cellSize / 3.22
        )
      }
    }
  }
}

