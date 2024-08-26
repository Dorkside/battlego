import { state } from '../shared'

// Get total liberties of a group of cells
export const getGroupLiberties = (group) => {
  return group
    .map(({ x, y }) => state.libertiesState[y][x])
    .reduce((s, cell) => {
      cell.forEach((l) => s.add(l))
      return s
    }, new Set()).size
}

