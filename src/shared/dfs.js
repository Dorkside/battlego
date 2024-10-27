import { boardSize } from './constants'

// Depth-first search to find the group of cells that are connected
export const dfs = (gridState, x, y, visited, group, player) => {
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return
  }
  if (visited[y][x]) {
    return
  }
  visited[y][x] = true
  if (gridState[y][x] === null) {
    return
  }
  if (gridState[y][x] === player) {
    group.push({ x, y })
    dfs(gridState, x - 1, y, visited, group, player)
    dfs(gridState, x + 1, y, visited, group, player)
    dfs(gridState, x, y - 1, visited, group, player)
    dfs(gridState, x, y + 1, visited, group, player)
  }
}

