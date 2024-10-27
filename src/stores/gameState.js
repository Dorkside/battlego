import { defineStore } from 'pinia'
import { checkPossibleMoves, findGroup, getGroupLiberties } from '../shared'
import { EventBus } from '../game/EventBus'

export const useGameState = defineStore('gameState', {
  state: () => ({
    // following grid contains the current state of the game
    // null means empty, 'white' means white player, 'black' means black player
    gridState: Array(5)
      .fill(null)
      .map(() => Array(5).fill(null)),
    hoveredCell: null,
    currentPlayer: 'black',
    whiteCaptured: 0,
    blackCaptured: 0,
    boardStates: [], // will be used to avoid Ko rule
    whiteVictories: 0,
    blackVictories: 0,
    gameOver: false
  }),
  actions: {
    updateGridState(x, y, value) {
      if (value !== null && value !== 'white' && value !== 'black') {
        throw new Error('Invalid value')
      }
      this.gridState[y][x] = value
      this.boardStates.push(
        this.gridState.map((row) => row.map((cell) => cell ?? ' ').join('')).join('')
      )
      this.boardStates = this.boardStates.slice(-2)
      EventBus.emit('current-grid-state', {
        gridState: this.gridState,
        hoveredCell: null
      })
    },
    revertGridState() {
      this.boardStates.pop()
      this.gridState = this.boardStates[this.boardStates.length - 1]
      EventBus.emit('current-grid-state', {
        gridState: this.gridState,
        hoveredCell: null
      })
    },
    updateCurrentPlayer(player) {
      if (player !== 'white' && player !== 'black') {
        throw new Error('Invalid player')
      }
      this.currentPlayer = player
    },
    updateHoverState(cell) {
      let canHover = false
      if (this.currentPlayer === 'white' && this.whitePossibleMoves[cell.y][cell.x]) {
        canHover = true
      }
      if (this.currentPlayer === 'black' && this.blackPossibleMoves[cell.y][cell.x]) {
        canHover = true
      }
      if (canHover === true) {
        this.hoveredCell = cell
      } else {
        this.hoveredCell = null
      }

      EventBus.emit('current-grid-state', {
        gridState: this.gridState,
        hoveredCell: this.hoveredCell
      })
    },
    removeDeadGroups(opponent, action) {
      const adjacentOpponentGroups = [
        findGroup(this.gridState, action.x - 1, action.y, opponent),
        findGroup(this.gridState, action.x + 1, action.y, opponent),
        findGroup(this.gridState, action.x, action.y - 1, opponent),
        findGroup(this.gridState, action.x, action.y + 1, opponent)
      ].filter((g) => g.length)

      for (const group of adjacentOpponentGroups) {
        if (getGroupLiberties(group, this.libertiesState) === 0) {
          for (const { x, y } of group) {
            this.updateGridState(x, y, null)
            if (opponent === 'white') {
              this.whiteCaptured++
            } else {
              this.blackCaptured++
            }
          }
        }
      }

      EventBus.emit('current-grid-state', {
        gridState: this.gridState,
        hoveredCell: null
      })
    },
    updateVictories(winner) {
      if (winner === 'white') {
        this.whiteVictories++
      } else {
        this.blackVictories++
      }
    },
    newGame() {
      this.gridState = Array(5)
        .fill(null)
        .map(() => Array(5).fill(null))
      this.gameOver = false
      this.currentPlayer = 'black'
      this.whiteCaptured = 0
      this.blackCaptured = 0
      this.boardStates = []
    }
  },
  getters: {
    // following grid contains the current state of the immediate
    // liberties of each cell
    libertiesState: (state) => {
      const liberties = Array(5)
        .fill(null)
        .map(() => Array(5).fill([]))

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          let libertiesItems = []
          if (state.gridState[y][x] !== null) {
            if (y > 0 && state.gridState[y - 1][x] === null) {
              libertiesItems.push(`${y - 1},${x}`)
            }
            if (y < 4 && state.gridState[y + 1][x] === null) {
              libertiesItems.push(`${y + 1},${x}`)
            }
            if (x > 0 && state.gridState[y][x - 1] === null) {
              libertiesItems.push(`${y},${x - 1}`)
            }
            if (x < 4 && state.gridState[y][x + 1] === null) {
              libertiesItems.push(`${y},${x + 1}`)
            }
            liberties[y][x] = libertiesItems
          }
        }
      }

      return liberties
    },
    whitePossibleMoves: (state) => {
      const possibleMoves = Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          possibleMoves[y][x] = checkPossibleMoves(
            state.gridState,
            state.libertiesState,
            state.boardStates,
            x,
            y,
            'white'
          )
        }
      }

      return possibleMoves
    },
    blackPossibleMoves: (state) => {
      const possibleMoves = Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          possibleMoves[y][x] = checkPossibleMoves(
            state.gridState,
            state.libertiesState,
            state.boardStates,
            x,
            y,
            'black'
          )
        }
      }

      return possibleMoves
    },
    blackScore: (state) => {
      let blackScore = 0
      let whiteScore = 0

      for (let i = 0; i < state.gridState.length; i++) {
        for (let j = 0; j < state.gridState[i].length; j++) {
          if (state.gridState[i][j] === 'black') {
            blackScore++
          } else if (state.gridState[i][j] === 'white') {
            whiteScore++
          } else {
            // check if the cell has the most black or white neighbours
            let neighbours = []

            if (i > 0 && state.gridState[i - 1][j] !== null) {
              neighbours.push(state.gridState[i - 1][j])
            }
            if (i < 4 && state.gridState[i + 1][j] !== null) {
              neighbours.push(state.gridState[i + 1][j])
            }
            if (j > 0 && state.gridState[i][j - 1] !== null) {
              neighbours.push(state.gridState[i][j - 1])
            }
            if (j < 4 && state.gridState[i][j + 1] !== null) {
              neighbours.push(state.gridState[i][j + 1])
            }

            const result = neighbours
              .map((cell) => {
                if (cell === 'black') return 1
                if (cell === 'white') return -1
                return 0
              })
              .reduce((acc, curr) => acc + curr, 0)

            if (result > 0) {
              blackScore++
            }
            if (result < 0) {
              whiteScore++
            }
          }
        }
      }

      return blackScore
    },
    whiteScore: (state) => {
      let blackScore = 0
      let whiteScore = 0

      for (let i = 0; i < state.gridState.length; i++) {
        for (let j = 0; j < state.gridState[i].length; j++) {
          if (state.gridState[i][j] === 'black') {
            blackScore++
          } else if (state.gridState[i][j] === 'white') {
            whiteScore++
          } else {
            // check if the cell has the most black or white neighbours
            let neighbours = []

            if (i > 0 && state.gridState[i - 1][j] !== null) {
              neighbours.push(state.gridState[i - 1][j])
            }
            if (i < 4 && state.gridState[i + 1][j] !== null) {
              neighbours.push(state.gridState[i + 1][j])
            }
            if (j > 0 && state.gridState[i][j - 1] !== null) {
              neighbours.push(state.gridState[i][j - 1])
            }
            if (j < 4 && state.gridState[i][j + 1] !== null) {
              neighbours.push(state.gridState[i][j + 1])
            }

            const result = neighbours
              .map((cell) => {
                if (cell === 'black') return 1
                if (cell === 'white') return -1
                return 0
              })
              .reduce((acc, curr) => acc + curr, 0)

            if (result > 0) {
              blackScore++
            }
            if (result < 0) {
              whiteScore++
            }
          }
        }
      }

      return whiteScore
    }
  }
})

