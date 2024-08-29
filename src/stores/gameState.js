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
    currentPlayer: 'black'
  }),
  actions: {
    updateGridState(x, y, value) {
      if (value !== null && value !== 'white' && value !== 'black') {
        throw new Error('Invalid value')
      }
      this.gridState[y][x] = value
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
      EventBus.emit('turn-switched', player)
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
          }
        }
      }

      EventBus.emit('current-grid-state', {
        gridState: this.gridState,
        hoveredCell: null
      })
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
            x,
            y,
            'black'
          )
        }
      }

      return possibleMoves
    }
  }
})

