import { describe, it, expect } from 'vitest'
import { checkPossibleMoves } from '../shared'

describe('checkPossibleMoves.js', () => {
  const parseBoardString = (str) => {
    return str
      .trim()
      .split('\n')
      .map((line) =>
        line
          .trim()
          .split(' ')
          .map((cell) => (cell === '.' ? null : cell))
      )
  }

  it('should return true for a playable move for white', () => {
    const boardString = `
      . . . . .
      . . . . .
      . . . . .
      . . . . .
      . . . . .
    `

    const mockBoardState = parseBoardString(boardString)

    const libertiesState = [
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []]
    ]

    const x = 3
    const y = 0
    const player = 'white'
    const result = checkPossibleMoves(mockBoardState, libertiesState, x, y, player)

    console.log(result)

    expect(result).toBe(true)
  })
})

