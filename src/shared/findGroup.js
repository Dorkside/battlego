import { dfs } from '.'
// Find the group of cells that are connected
export const findGroup = (gridState, x, y, player) => {
  const group = []
  const visited = Array(5)
    .fill(null)
    .map(() => Array(5).fill(false))

  dfs(gridState, x, y, visited, group, player)
  return group
}

