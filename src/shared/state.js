import { useGameState } from '../stores/gameState'

let state

export const initializeState = async () => {
  state = await useGameState()
  return state
}

export { state }

