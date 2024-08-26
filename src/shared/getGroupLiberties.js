// Get total liberties of a group of cells
export const getGroupLiberties = (group, libertiesState) => {
  return group
    .map(({ x, y }) => libertiesState[y][x])
    .reduce((s, cell) => {
      cell.forEach((l) => s.add(l))
      return s
    }, new Set()).size
}

