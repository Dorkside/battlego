import { dfs } from '.'
import { boardSize } from './constants'
// Find the group of cells that are connected
export const findGroup = (gridState, x, y, player) => {
  const group = []
  const visited = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(false))

  dfs(gridState, x, y, visited, group, player)
  return group
}

