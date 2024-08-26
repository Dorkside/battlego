import { defineStore } from 'pinia'
import { checkPossibleMoves } from '../shared'
import { EventBus } from '../game/EventBus'

export const useGameState = defineStore('gameState', {
  state: () => ({
    // following grid contains the current state of the game
    // null means empty, 'white' means white player, 'black' means black player
    gridState: Array(5)
      .fill(null)
      .map(() => Array(5).fill(null))
  }),
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    updateGridState(x, y, value) {
      if (value !== null && value !== 'white' && value !== 'black') {
        throw new Error('Invalid value')
      }
      this.gridState[y][x] = value
      EventBus.emit('current-grid-state', this.gridState)
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
          possibleMoves[y][x] = checkPossibleMoves(state.gridState, x, y, 'white')
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
          possibleMoves[y][x] = checkPossibleMoves(state.gridState, x, y, 'black')
        }
      }

      return possibleMoves
    }
  }
})

