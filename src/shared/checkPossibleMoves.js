import { findGroup, getGroupLiberties } from './'
import { boardSize } from './constants'

export const checkPossibleMoves = (gridState, libertiesState, boardStates, x, y, p) => {
  // Checkl if the cell is in bounds
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return false
  }
  // Check if the cell is empty
  if (gridState[y][x] === null) {
    // Check if the cell has one adjacent empty cell
    if (
      (y > 0 && gridState[y - 1][x] === null) ||
      (y < boardSize - 1 && gridState[y + 1][x] === null) ||
      (x > 0 && gridState[y][x - 1] === null) ||
      (x < boardSize - 1 && gridState[y][x + 1] === null)
    ) {
      return true
    }
    // Check if the cell has one adjacent player group with at least 2 liberties
    let validAdjacentPlayerGroup = false
    const adjacentPlayerGroups = [
      findGroup(gridState, x - 1, y, p),
      findGroup(gridState, x + 1, y, p),
      findGroup(gridState, x, y - 1, p),
      findGroup(gridState, x, y + 1, p)
    ].filter((g) => g.length)
    if (
      adjacentPlayerGroups.length &&
      adjacentPlayerGroups.some((group) => {
        if (getGroupLiberties(group, libertiesState) >= 2) {
          return true
        }
        return false
      })
    ) {
      validAdjacentPlayerGroup = true
    }

    const opponent = p === 'white' ? 'black' : 'white'
    // Check if the cell has one adjacent enemy group with a single liberty
    let validAdjacentOpponentGroup = false
    const adjacentOpponentGroups = [
      findGroup(gridState, x - 1, y, opponent),
      findGroup(gridState, x + 1, y, opponent),
      findGroup(gridState, x, y - 1, opponent),
      findGroup(gridState, x, y + 1, opponent)
    ].filter((g) => g.length)
    if (
      adjacentOpponentGroups.length &&
      adjacentOpponentGroups.some((group) => {
        if (getGroupLiberties(group, libertiesState) === 1) {
          return true
        }
        return false
      })
    ) {
      validAdjacentOpponentGroup = true
    }

    const isKo = boardStates.includes(
      gridState
        .map((row, rowY) =>
          row
            .map((cell, cellX) => {
              if (x === cellX && y === rowY) {
                return p
              }
              return cell ?? ' '
            })
            .join('')
        )
        .join('')
    )

    if ((validAdjacentPlayerGroup || validAdjacentOpponentGroup) && !isKo) {
      return true
    }
  }

  return false
}

